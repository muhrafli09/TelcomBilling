<?php

namespace App\Services;

use App\Models\ActiveCall;
use App\Models\Tenant;
use Carbon\Carbon;

class AsteriskAmiService
{
    private $socket;
    private $host;
    private $port;
    private $username;
    private $secret;

    public function __construct()
    {
        $this->host = env('ASTERISK_AMI_HOST', '127.0.0.1');
        $this->port = env('ASTERISK_AMI_PORT', 5038);
        $this->username = env('ASTERISK_AMI_USERNAME', 'admin');
        $this->secret = env('ASTERISK_AMI_SECRET', 'admin123');
    }

    public function connect()
    {
        $this->socket = fsockopen($this->host, $this->port, $errno, $errstr, 10);
        
        if (!$this->socket) {
            throw new \Exception("Cannot connect to Asterisk AMI: $errstr ($errno)");
        }

        // Read welcome message
        $this->readResponse();

        // Login
        $this->sendAction([
            'Action' => 'Login',
            'Username' => $this->username,
            'Secret' => $this->secret
        ]);

        $response = $this->readResponse();
        if (strpos($response, 'Success') === false) {
            throw new \Exception('AMI Login failed');
        }

        return true;
    }

    public function disconnect()
    {
        if ($this->socket) {
            $this->sendAction(['Action' => 'Logoff']);
            fclose($this->socket);
        }
    }

    public function getActiveCalls()
    {
        $this->sendAction(['Action' => 'CoreShowChannels']);
        
        $response = $this->readResponse();
        $calls = [];
        
        // Parse response and extract active calls
        $lines = explode("\n", $response);
        foreach ($lines as $line) {
            if (strpos($line, 'Channel:') !== false) {
                // Parse channel information
                // This is simplified - real implementation would parse all AMI events
            }
        }
        
        return $calls;
    }

    public function startMonitoring()
    {
        // Subscribe to events
        $this->sendAction([
            'Action' => 'Events',
            'EventMask' => 'call,cdr'
        ]);

        while (true) {
            $event = $this->readResponse();
            $this->processEvent($event);
        }
    }

    private function processEvent($event)
    {
        $lines = explode("\n", $event);
        $eventData = [];
        
        foreach ($lines as $line) {
            if (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', $line, 2);
                $eventData[trim($key)] = trim($value);
            }
        }

        if (!isset($eventData['Event'])) {
            return;
        }

        switch ($eventData['Event']) {
            case 'Newchannel':
                $this->handleNewChannel($eventData);
                break;
            case 'Hangup':
                $this->handleHangup($eventData);
                break;
            case 'Bridge':
                $this->handleBridge($eventData);
                break;
        }
    }

    private function handleNewChannel($data)
    {
        if (!isset($data['Uniqueid']) || !isset($data['Channel'])) {
            return;
        }

        // Extract tenant from accountcode or context
        $accountcode = $data['AccountCode'] ?? '';
        $context = $data['Context'] ?? '';
        
        $tenant = Tenant::where('context', $accountcode)
            ->orWhere('context', $context)
            ->first();

        ActiveCall::updateOrCreate(
            ['uniqueid' => $data['Uniqueid']],
            [
                'channel' => $data['Channel'],
                'src' => $data['CallerIDNum'] ?? '',
                'dst' => $data['Exten'] ?? '',
                'context' => $context,
                'accountcode' => $accountcode,
                'state' => 'RINGING',
                'start_time' => Carbon::now(),
                'tenant_id' => $tenant ? $tenant->id : null
            ]
        );
    }

    private function handleHangup($data)
    {
        if (!isset($data['Uniqueid'])) {
            return;
        }

        $call = ActiveCall::where('uniqueid', $data['Uniqueid'])->first();
        if ($call) {
            $call->update([
                'state' => 'HANGUP',
                'end_time' => Carbon::now(),
                'duration' => Carbon::now()->diffInSeconds($call->start_time)
            ]);
        }
    }

    private function handleBridge($data)
    {
        if (!isset($data['Uniqueid1'])) {
            return;
        }

        $call = ActiveCall::where('uniqueid', $data['Uniqueid1'])->first();
        if ($call && $call->state === 'RINGING') {
            $call->update([
                'state' => 'ANSWERED',
                'answer_time' => Carbon::now()
            ]);
        }
    }

    private function sendAction($action)
    {
        $message = '';
        foreach ($action as $key => $value) {
            $message .= "$key: $value\r\n";
        }
        $message .= "\r\n";

        fwrite($this->socket, $message);
    }

    private function readResponse()
    {
        $response = '';
        while (($line = fgets($this->socket)) !== false) {
            $response .= $line;
            if (trim($line) === '') {
                break;
            }
        }
        return $response;
    }
}
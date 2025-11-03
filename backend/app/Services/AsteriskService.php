<?php

namespace App\Services;

class AsteriskService
{
    public function getActiveCalls()
    {
        $output = shell_exec('asterisk -rx "core show channels concise"');
        $calls = [];
        
        if ($output) {
            foreach (explode("\n", trim($output)) as $line) {
                if (strpos($line, '!') !== false) {
                    $parts = explode('!', $line);
                    if (count($parts) >= 8) {
                        $calls[] = [
                            'channel' => $parts[0],
                            'context' => $parts[1],
                            'extension' => $parts[2],
                            'state' => $parts[4],
                            'duration' => $parts[7]
                        ];
                    }
                }
            }
        }
        
        return $calls;
    }

    public function getSipPeers()
    {
        $output = shell_exec('asterisk -rx "sip show peers"');
        return $output ?: '';
    }
}
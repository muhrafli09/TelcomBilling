<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cdr;
use App\Models\Tenant;
use Carbon\Carbon;

class ImportCdrFromCsv extends Command
{
    protected $signature = 'cdr:import-csv {file}';
    protected $description = 'Import CDR data from CSV file';

    public function handle()
    {
        $file = $this->argument('file');
        
        if (!file_exists($file)) {
            $this->error("File not found: $file");
            return 1;
        }

        $this->info("Importing CDR data from: $file");
        
        $handle = fopen($file, 'r');
        $header = fgetcsv($handle); // Skip header
        
        $count = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) < 9) continue;
            
            // Check if first column is AccountCode (new format) or Extension (old format)
            if (strpos($data[0], 'GLO-') === 0) {
                // New format: AccountCode,Extension,Caller_ID,Destination,Call_Date,Call_Time...
                $accountcode = $data[0];
                $extension = $data[1];
                $callerid = str_replace(['"', '<', '>'], '', $data[2]);
                $destination = $data[3];
                $calldate = $data[4] . ' ' . $data[5];
                $disposition = $data[6];
                $duration = (int)$data[7];
                $billsec = (int)$data[8];
                $category = $data[9] ?? '';
            } else {
                // Old format: Extension,Caller_ID,Destination,Call_Date,Call_Time...
                $extension = $data[0];
                $callerid = str_replace(['"', '<', '>'], '', $data[1]);
                $destination = $data[2];
                $calldate = $data[3] . ' ' . $data[4];
                $disposition = $data[5];
                $duration = (int)$data[6];
                $billsec = (int)$data[7];
                $category = $data[8];
                $accountcode = "GLO-{$extension}-001";
            }
            
            Cdr::create([
                'calldate' => Carbon::parse($calldate),
                'clid' => $callerid,
                'src' => $extension,
                'dst' => $destination,
                'dcontext' => 'from-internal',
                'channel' => "SIP/{$extension}",
                'dstchannel' => '',
                'lastapp' => 'Dial',
                'lastdata' => '',
                'duration' => $duration,
                'billsec' => $billsec,
                'disposition' => $disposition,
                'amaflags' => 3,
                'accountcode' => $accountcode,
                'uniqueid' => uniqid(),
                'userfield' => $category
            ]);
            
            $count++;
            if ($count % 100 == 0) {
                $this->info("Imported $count records...");
            }
        }
        
        fclose($handle);
        $this->info("Successfully imported $count CDR records");
        
        return 0;
    }
}
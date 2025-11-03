<?php

namespace App\Services;

class CdrService
{
    private $cdrPath;

    public function __construct()
    {
        $this->cdrPath = env('CDR_PATH', '/root/cdr');
    }

    public function getBillingData($accountCode, $days = 30)
    {
        $billingData = [];
        $totalCost = 0;

        for ($i = 0; $i < $days; $i++) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $yearMonth = date('Y/m', strtotime("-{$i} days"));
            $filename = "{$this->cdrPath}/{$yearMonth}/CDR_{$date}.csv";

            if (file_exists($filename)) {
                $handle = fopen($filename, 'r');
                $headers = fgetcsv($handle);
                
                while (($row = fgetcsv($handle)) !== false) {
                    $data = array_combine($headers, $row);
                    
                    if ($data['AccountCode'] === $accountCode) {
                        $cost = floatval($data['Total_Cost'] ?? 0);
                        $totalCost += $cost;
                        
                        $billingData[] = [
                            'date' => $data['Call_Date'],
                            'time' => $data['Call_Time'],
                            'destination' => $data['Destination'],
                            'duration' => $data['Duration'],
                            'cost' => $cost,
                            'status' => $data['Status']
                        ];
                    }
                }
                fclose($handle);
            }
        }

        return [
            'calls' => $billingData,
            'total_cost' => $totalCost,
            'call_count' => count($billingData)
        ];
    }

    public function getMonthlyReport($accountCode, $year, $month)
    {
        $filename = "{$this->cdrPath}/{$year}/{$month}/Monthly_Summary_{$year}-{$month}.csv";
        
        if (!file_exists($filename)) {
            return null;
        }

        $handle = fopen($filename, 'r');
        $headers = fgetcsv($handle);
        
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($headers, $row);
            if ($data['AccountCode'] === $accountCode) {
                fclose($handle);
                return $data;
            }
        }
        
        fclose($handle);
        return null;
    }
}
'use client';

import { useState, useEffect } from 'react';
import { customerApi } from '@/lib/api';

interface BillingData {
  calls: Array<{
    date: string;
    time: string;
    destination: string;
    duration: string;
    cost: number;
    status: string;
  }>;
  total_cost: number;
  call_count: number;
}

interface ActiveCall {
  channel: string;
  context: string;
  extension: string;
  state: string;
  duration: string;
}

export default function CustomerDashboard() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    }
    
    fetchDashboardData();
    
    const interval = setInterval(fetchActiveCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await customerApi.getDashboard();
      setBilling(response.data.billing);
      setActiveCalls(response.data.active_calls);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const response = await customerApi.getActiveCalls();
      setActiveCalls(response.data.calls);
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {customer?.name}
          </h1>
          <p className="text-gray-600">Account: {customer?.account_code}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Cost</h3>
            <p className="text-2xl font-bold text-blue-600">
              IDR {billing?.total_cost?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Calls</h3>
            <p className="text-2xl font-bold text-green-600">
              {billing?.call_count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Calls</h3>
            <p className="text-2xl font-bold text-orange-600">
              {activeCalls.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Calls</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Destination</th>
                      <th className="text-left py-2">Duration</th>
                      <th className="text-left py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing?.calls.slice(0, 10).map((call, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{call.date}</td>
                        <td className="py-2">{call.destination}</td>
                        <td className="py-2">{call.duration}</td>
                        <td className="py-2">IDR {call.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Active Calls</h2>
            </div>
            <div className="p-6">
              {activeCalls.length > 0 ? (
                <div className="space-y-3">
                  {activeCalls.map((call, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{call.channel}</div>
                      <div className="text-sm text-gray-600">
                        Extension: {call.extension} | State: {call.state}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active calls</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
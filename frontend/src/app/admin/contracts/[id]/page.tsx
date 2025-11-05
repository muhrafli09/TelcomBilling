'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Contract {
  id: number;
  company_name: string;
  accountcode: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  company_address: string;
  monthly_fee: number;
  status: string;
  notes?: string;
  rates: ContractRate[];
}

interface ContractRate {
  id: number;
  destination_prefix: string;
  destination_name: string;
  rate_per_minute: number;
  minimum_duration: number;
  billing_increment: number;
  connection_fee: number;
  active: boolean;
}

export default function ContractDetailPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState<ContractRate | null>(null);
  const router = useRouter();
  const params = useParams();

  const [rateData, setRateData] = useState({
    destination_prefix: '',
    destination_name: '',
    rate_per_minute: 0,
    minimum_duration: 1,
    billing_increment: 1,
    connection_fee: 0
  });

  useEffect(() => {
    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContract(data);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRate 
        ? `${process.env.NEXT_PUBLIC_API_URL}/contracts/${params.id}/rates/${editingRate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/contracts/${params.id}/rates`;
      
      const method = editingRate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rateData),
      });

      if (response.ok) {
        fetchContract();
        setShowRateForm(false);
        setEditingRate(null);
        setRateData({
          destination_prefix: '',
          destination_name: '',
          rate_per_minute: 0,
          minimum_duration: 1,
          billing_increment: 1,
          connection_fee: 0
        });
      }
    } catch (error) {
      console.error('Error saving rate:', error);
    }
  };

  const handleEditRate = (rate: ContractRate) => {
    setEditingRate(rate);
    setRateData({
      destination_prefix: rate.destination_prefix,
      destination_name: rate.destination_name,
      rate_per_minute: rate.rate_per_minute,
      minimum_duration: rate.minimum_duration,
      billing_increment: rate.billing_increment,
      connection_fee: rate.connection_fee
    });
    setShowRateForm(true);
  };

  const handleDeleteRate = async (rateId: number) => {
    if (confirm('Are you sure you want to delete this rate?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${params.id}/rates/${rateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchContract();
        }
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
        <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
          LOADING CONTRACT...
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
        <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
          CONTRACT NOT FOUND
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
      <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>CONTRACT DETAIL</h1>
          <button
            onClick={() => router.push('/admin/contracts')}
            style={{
              padding: '10px 20px',
              border: '2px solid #000',
              backgroundColor: '#fff',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            BACK TO CONTRACTS
          </button>
        </div>

        {/* Contract Info */}
        <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', backgroundColor: '#fff' }}>
          <h2 style={{ margin: '0 0 15px 0' }}>CONTRACT INFORMATION</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><strong>Company:</strong> {contract.company_name}</div>
            <div><strong>Account Code:</strong> {contract.accountcode}</div>
            <div><strong>Contact:</strong> {contract.contact_person}</div>
            <div><strong>Email:</strong> {contract.contact_email}</div>
            <div><strong>Phone:</strong> {contract.contact_phone}</div>
            <div><strong>Monthly Fee:</strong> Rp {contract.monthly_fee.toLocaleString()}</div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <strong>Address:</strong> {contract.company_address}
          </div>
        </div>

        {/* Rates Section */}
        <div style={{ border: '2px solid #000', padding: '20px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>RATES ({contract.rates.length})</h2>
            <button
              onClick={() => {
                setShowRateForm(true);
                setEditingRate(null);
                setRateData({
                  destination_prefix: '',
                  destination_name: '',
                  rate_per_minute: 0,
                  minimum_duration: 1,
                  billing_increment: 1,
                  connection_fee: 0
                });
              }}
              style={{
                padding: '10px 20px',
                border: '2px solid #000',
                backgroundColor: '#000',
                color: '#fff',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ADD RATE
            </button>
          </div>

          {/* Rate Form */}
          {showRateForm && (
            <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>
                {editingRate ? 'EDIT RATE' : 'ADD NEW RATE'}
              </h3>
              <form onSubmit={handleRateSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      PREFIX:
                    </label>
                    <input
                      type="text"
                      value={rateData.destination_prefix}
                      onChange={(e) => setRateData({...rateData, destination_prefix: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      DESTINATION:
                    </label>
                    <input
                      type="text"
                      value={rateData.destination_name}
                      onChange={(e) => setRateData({...rateData, destination_name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      RATE/MIN:
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={rateData.rate_per_minute}
                      onChange={(e) => setRateData({...rateData, rate_per_minute: parseFloat(e.target.value) || 0})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      MIN DURATION:
                    </label>
                    <input
                      type="number"
                      value={rateData.minimum_duration}
                      onChange={(e) => setRateData({...rateData, minimum_duration: parseInt(e.target.value) || 1})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      BILLING INCREMENT:
                    </label>
                    <input
                      type="number"
                      value={rateData.billing_increment}
                      onChange={(e) => setRateData({...rateData, billing_increment: parseInt(e.target.value) || 1})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      CONNECTION FEE:
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={rateData.connection_fee}
                      onChange={(e) => setRateData({...rateData, connection_fee: parseFloat(e.target.value) || 0})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #000',
                        fontFamily: 'Courier New, monospace'
                      }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      border: '2px solid #000',
                      backgroundColor: '#000',
                      color: '#fff',
                      fontFamily: 'Courier New, monospace',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {editingRate ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRateForm(false);
                      setEditingRate(null);
                    }}
                    style={{
                      padding: '10px 20px',
                      border: '2px solid #000',
                      backgroundColor: '#fff',
                      fontFamily: 'Courier New, monospace',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rates Table */}
          <div style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>PREFIX</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>DESTINATION</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>RATE/MIN</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>MIN DUR</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>INCREMENT</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>CONN FEE</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {contract.rates.map((rate) => (
                  <tr key={rate.id} style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '10px', border: '1px solid #000', fontWeight: 'bold' }}>
                      {rate.destination_prefix}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      {rate.destination_name}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      Rp {rate.rate_per_minute.toFixed(4)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      {rate.minimum_duration}s
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      {rate.billing_increment}s
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      Rp {rate.connection_fee.toFixed(4)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditRate(rate)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #000',
                          backgroundColor: '#fff',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '12px',
                          marginRight: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDeleteRate(rate.id)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #000',
                          backgroundColor: '#ff4444',
                          color: '#fff',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contract.rates.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                NO RATES CONFIGURED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
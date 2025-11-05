'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  created_at: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company_name: '',
    accountcode: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    company_address: '',
    monthly_fee: 0,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching contracts with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch contracts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Contracts data:', data);
        setContracts(data);
      } else {
        const errorData = await response.text();
        console.error('Error fetching contracts:', errorData);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingContract 
        ? `${process.env.NEXT_PUBLIC_API_URL}/contracts/${editingContract.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/contracts`;
      
      const method = editingContract ? 'PUT' : 'POST';

      console.log('Submitting contract data:', formData);
      console.log('API URL:', url);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Contract saved successfully');
        fetchContracts();
        setShowForm(false);
        setEditingContract(null);
        setFormData({
          company_name: '',
          accountcode: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          company_address: '',
          monthly_fee: 0,
          status: 'active',
          notes: ''
        });
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        alert(`Error saving contract: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      alert(`Network error: ${error}`);
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      company_name: contract.company_name,
      accountcode: contract.accountcode,
      contact_person: contract.contact_person,
      contact_email: contract.contact_email,
      contact_phone: contract.contact_phone,
      company_address: contract.company_address,
      monthly_fee: contract.monthly_fee,
      status: contract.status,
      notes: contract.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchContracts();
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
        <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
          LOADING CONTRACTS...
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
      <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>CONTRACT MANAGEMENT</h1>
          <div>
            <button
              onClick={() => router.push('/admin')}
              style={{
                padding: '10px 20px',
                border: '2px solid #000',
                backgroundColor: '#fff',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              BACK TO ADMIN
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingContract(null);
                setFormData({
                  company_name: '',
                  accountcode: '',
                  contact_person: '',
                  contact_email: '',
                  contact_phone: '',
                  company_address: '',
                  monthly_fee: 0,
                  status: 'active',
                  notes: ''
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
              ADD CONTRACT
            </button>
          </div>
        </div>

        {showForm && (
          <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>
              {editingContract ? 'EDIT CONTRACT' : 'ADD NEW CONTRACT'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    COMPANY NAME:
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    ACCOUNT CODE:
                  </label>
                  <input
                    type="text"
                    value={formData.accountcode}
                    onChange={(e) => setFormData({...formData, accountcode: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    CONTACT PERSON:
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    EMAIL:
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    PHONE:
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    MONTHLY FEE:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({...formData, monthly_fee: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    STATUS:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="suspended">SUSPENDED</option>
                    <option value="terminated">TERMINATED</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '20px', gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ADDRESS:
                </label>
                <textarea
                  value={formData.company_address}
                  onChange={(e) => setFormData({...formData, company_address: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #000',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              <div style={{ marginTop: '20px', gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  NOTES (Optional):
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #000',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
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
                  {editingContract ? 'UPDATE' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingContract(null);
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

        <div style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>COMPANY</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>ACCOUNT CODE</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>CONTACT</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>EMAIL</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>STATUS</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '15px', border: '1px solid #000' }}>
                    <div style={{ fontWeight: 'bold' }}>{contract.company_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{contract.contact_phone}</div>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000', fontWeight: 'bold' }}>
                    {contract.accountcode}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000' }}>
                    {contract.contact_person}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000' }}>
                    {contract.contact_email}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000' }}>
                    <span style={{
                      padding: '5px 10px',
                      border: '1px solid #000',
                      backgroundColor: contract.status === 'active' ? '#90EE90' : '#FFB6C1',
                      fontWeight: 'bold'
                    }}>
                      {contract.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>
                    <button
                      onClick={() => router.push(`/admin/contracts/${contract.id}`)}
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #000',
                        backgroundColor: '#0066cc',
                        color: '#fff',
                        fontFamily: 'Courier New, monospace',
                        fontSize: '12px',
                        marginRight: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      DETAIL
                    </button>
                    <button
                      onClick={() => handleEdit(contract)}
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
                      onClick={() => handleDelete(contract.id)}
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
          {contracts.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold' }}>
              NO CONTRACTS FOUND
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
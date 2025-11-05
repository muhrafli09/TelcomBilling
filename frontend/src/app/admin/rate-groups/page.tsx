'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RateGroup {
  id: number;
  name: string;
  memo: string;
  number_of_rates: number;
  number_of_using: number;
  created_at: string;
}

interface Rate {
  id: number;
  rate_group_id: number;
  rate_prefix: string;
  area_prefix: string;
  rate_type: string;
  billing_rate: number;
  billing_cycle: string;
}

export default function RateGroupsPage() {
  const [rateGroups, setRateGroups] = useState<RateGroup[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RateGroup | null>(null);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const router = useRouter();

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    memo: ''
  });

  const [rateFormData, setRateFormData] = useState({
    rate_group_id: 0,
    rate_prefix: '',
    area_prefix: '',
    rate_type: 'per_minute',
    billing_rate: '',
    billing_cycle: '60'
  });

  useEffect(() => {
    fetchRateGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchRates(selectedGroupId);
    }
  }, [selectedGroupId]);

  const fetchRateGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rate-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRateGroups(data);
      }
    } catch (error) {
      console.error('Error fetching rate groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async (groupId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rate-groups/${groupId}/rates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRates(data);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingGroup 
        ? `${process.env.NEXT_PUBLIC_API_URL}/rate-groups/${editingGroup.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/rate-groups`;
      
      const method = editingGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupFormData),
      });

      if (response.ok) {
        fetchRateGroups();
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupFormData({ name: '', memo: '' });
      }
    } catch (error) {
      console.error('Error saving rate group:', error);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRate 
        ? `${process.env.NEXT_PUBLIC_API_URL}/rates/${editingRate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/rates`;
      
      const method = editingRate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...rateFormData,
          billing_rate: parseFloat(rateFormData.billing_rate),
          billing_cycle: parseInt(rateFormData.billing_cycle)
        }),
      });

      if (response.ok) {
        if (selectedGroupId) fetchRates(selectedGroupId);
        fetchRateGroups();
        setShowRateForm(false);
        setEditingRate(null);
        setRateFormData({
          rate_group_id: selectedGroupId || 0,
          rate_prefix: '',
          area_prefix: '',
          rate_type: 'per_minute',
          billing_rate: '',
          billing_cycle: '60'
        });
      }
    } catch (error) {
      console.error('Error saving rate:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
        <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
          LOADING RATE GROUPS...
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Courier New, monospace', padding: '20px' }}>
      <div style={{ border: '3px solid #000', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>RATE MANAGEMENT</h1>
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
                setShowGroupForm(true);
                setEditingGroup(null);
                setGroupFormData({ name: '', memo: '' });
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
              ADD RATE GROUP
            </button>
          </div>
        </div>

        {showGroupForm && (
          <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>
              {editingGroup ? 'EDIT RATE GROUP' : 'ADD NEW RATE GROUP'}
            </h2>
            <form onSubmit={handleGroupSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    GROUP NAME:
                  </label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
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
                    MEMO:
                  </label>
                  <input
                    type="text"
                    value={groupFormData.memo}
                    onChange={(e) => setGroupFormData({...groupFormData, memo: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #000',
                      fontFamily: 'Courier New, monospace',
                      fontSize: '14px'
                    }}
                  />
                </div>
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
                  {editingGroup ? 'UPDATE' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupForm(false);
                    setEditingGroup(null);
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

        <div style={{ border: '2px solid #000', backgroundColor: '#fff', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>GROUP NAME</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'left' }}>MEMO</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>RATES</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>USING</th>
                <th style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rateGroups.map((group) => (
                <tr key={group.id} style={{ 
                  borderBottom: '1px solid #000',
                  backgroundColor: selectedGroupId === group.id ? '#e0e0e0' : 'transparent'
                }}>
                  <td style={{ padding: '15px', border: '1px solid #000', fontWeight: 'bold' }}>
                    <button
                      onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: 'Courier New, monospace',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {group.name}
                    </button>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000' }}>
                    {group.memo}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>
                    {group.number_of_rates}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>
                    {group.number_of_using}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #000', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setGroupFormData({
                          name: group.name,
                          memo: group.memo
                        });
                        setShowGroupForm(true);
                      }}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rateGroups.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold' }}>
              NO RATE GROUPS FOUND
            </div>
          )}
        </div>

        {selectedGroupId && (
          <div style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
            <div style={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>
                RATES FOR: {rateGroups.find(g => g.id === selectedGroupId)?.name}
              </h3>
              <button
                onClick={() => {
                  setShowRateForm(true);
                  setEditingRate(null);
                  setRateFormData({
                    rate_group_id: selectedGroupId,
                    rate_prefix: '',
                    area_prefix: '',
                    rate_type: 'per_minute',
                    billing_rate: '',
                    billing_cycle: '60'
                  });
                }}
                style={{
                  padding: '8px 15px',
                  border: '2px solid #fff',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ADD RATE
              </button>
            </div>

            {showRateForm && (
              <div style={{ border: '2px solid #000', padding: '20px', margin: '20px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>
                  {editingRate ? 'EDIT RATE' : 'ADD NEW RATE'}
                </h3>
                <form onSubmit={handleRateSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        RATE PREFIX:
                      </label>
                      <input
                        type="text"
                        value={rateFormData.rate_prefix}
                        onChange={(e) => setRateFormData({...rateFormData, rate_prefix: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #000',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        AREA PREFIX:
                      </label>
                      <input
                        type="text"
                        value={rateFormData.area_prefix}
                        onChange={(e) => setRateFormData({...rateFormData, area_prefix: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #000',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        RATE TYPE:
                      </label>
                      <select
                        value={rateFormData.rate_type}
                        onChange={(e) => setRateFormData({...rateFormData, rate_type: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #000',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}
                      >
                        <option value="per_minute">PER MINUTE</option>
                        <option value="per_second">PER SECOND</option>
                        <option value="flat_rate">FLAT RATE</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        BILLING RATE (IDR):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rateFormData.billing_rate}
                        onChange={(e) => setRateFormData({...rateFormData, billing_rate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #000',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        BILLING CYCLE (SEC):
                      </label>
                      <select
                        value={rateFormData.billing_cycle}
                        onChange={(e) => setRateFormData({...rateFormData, billing_cycle: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #000',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px'
                        }}
                      >
                        <option value="1">1 SECOND</option>
                        <option value="6">6 SECONDS</option>
                        <option value="30">30 SECONDS</option>
                        <option value="60">60 SECONDS</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 15px',
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
                        padding: '8px 15px',
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

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>RATE PREFIX</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>AREA PREFIX</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'left' }}>TYPE</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'right' }}>RATE (IDR)</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>CYCLE</th>
                  <th style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '10px', border: '1px solid #000', fontWeight: 'bold' }}>
                      {rate.rate_prefix}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      {rate.area_prefix}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000' }}>
                      {rate.rate_type.toUpperCase()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000', textAlign: 'right' }}>
                      {rate.billing_rate.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>
                      {rate.billing_cycle}s
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #000', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingRate(rate);
                          setRateFormData({
                            rate_group_id: rate.rate_group_id,
                            rate_prefix: rate.rate_prefix,
                            area_prefix: rate.area_prefix,
                            rate_type: rate.rate_type,
                            billing_rate: rate.billing_rate.toString(),
                            billing_cycle: rate.billing_cycle.toString()
                          });
                          setShowRateForm(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #000',
                          backgroundColor: '#fff',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        EDIT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rates.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                NO RATES FOUND FOR THIS GROUP
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
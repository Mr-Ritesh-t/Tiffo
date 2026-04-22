import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import * as storageService from '../services/storageService';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === 'owner';

  // Customer specific states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [diet, setDiet] = useState('veg');

  // Owner specific states
  const [messName, setMessName] = useState('');
  const [messAddress, setMessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [cuisine, setCuisine] = useState('north_indian');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [deliveryOptions, setDeliveryOptions] = useState('pickup');
  const [pricePerMeal, setPricePerMeal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isOwner) {
      if (!messName || !messAddress || !businessPhone || !pricePerMeal) {
        return setError('Please fill all required business fields (Name, Phone, Address, Price).');
      }
    } else {
      if (!phone || !address) {
        return setError('Please provide your phone number and delivery address.');
      }
    }

    setLoading(true);
    try {
      const profileData = isOwner ? {
        messName,
        messAddress,
        phone: businessPhone,
        cuisine,
        openingTime,
        closingTime,
        deliveryOptions,
        pricePerMeal: Number(pricePerMeal),
        imageUrl,
        gallery: imageUrl ? [imageUrl] : [],
        onboardingCompleted: true
      } : {
        phone,
        address,
        diet,
        onboardingCompleted: true
      };

      await completeOnboarding(profileData);
      
      navigate(isOwner ? '/owner/dashboard' : '/messes');
    } catch (err) {
      setError('Failed to save profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page" style={{ minHeight: '100vh', backgroundColor: 'var(--gray-50)', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ maxWidth: '600px', margin: '4rem auto 0', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
              {isOwner ? 'storefront' : 'how_to_reg'}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Complete your profile
            </h1>
            <p style={{ color: 'var(--gray-500)' }}>
              {isOwner 
                ? "Let's set up your mess partner account so customers can find you."
                : "Just a few more details so we can deliver your perfect meal."}
            </p>
          </div>

          {error && (
            <div style={{ color: '#ef5350', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!isOwner && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Phone Number <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Default Delivery Address <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <textarea 
                    className="input-field" 
                    placeholder="Flat No, Building, Street, Area"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Dietary Preference
                  </label>
                  <select 
                    className="input-field"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="veg">Pure Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </>
            )}

            {isOwner && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Mess / Business Name <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Sharmaji Ki Rasoi"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Owner / Business Phone <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="Contact number for customers"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Mess Location <span style={{ color: '#ef5350' }}>*</span>
                  </label>
                  <textarea 
                    className="input-field" 
                    placeholder="Full address of your mess kitchen"
                    rows="2"
                    value={messAddress}
                    onChange={(e) => setMessAddress(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Primary Cuisine Type
                  </label>
                  <select 
                    className="input-field"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="north_indian">North Indian</option>
                    <option value="south_indian">South Indian</option>
                    <option value="maharashtrian">Maharashtrian</option>
                    <option value="bengali">Bengali</option>
                    <option value="mixed">Mixed / Pan-Indian</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                      Opening Time
                    </label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                      Closing Time
                    </label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                      Delivery Options
                    </label>
                    <select 
                      className="input-field"
                      value={deliveryOptions}
                      onChange={(e) => setDeliveryOptions(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="pickup">Pickup Only</option>
                      <option value="delivery">Delivery Only</option>
                      <option value="both">Pickup & Delivery</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                      Avg Price per Meal (₹) <span style={{ color: '#ef5350' }}>*</span>
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      className="input-field" 
                      placeholder="e.g. 120"
                      value={pricePerMeal}
                      onChange={(e) => setPricePerMeal(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
                    Mess Cover Photo (Recommended)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label 
                      className={`btn ${uploading ? 'disabled' : 'btn-outline'}`} 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        padding: '0.75rem',
                        border: '2px dashed var(--gray-300)',
                        backgroundColor: 'var(--gray-50)'
                      }}
                    >
                      <span className="material-icons">{uploading ? 'sync' : 'add_a_photo'}</span>
                      {uploading ? 'Uploading...' : 'Click to Upload Photo'}
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const url = await storageService.uploadFile(file);
                            setImageUrl(url);
                          } catch (err) {
                            setError(err.message);
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                    {imageUrl && (
                      <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                        <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                    A good photo helps customers trust your mess.
                  </p>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Complete Registration'}
              {!loading && <span className="material-icons" style={{ marginLeft: '8px' }}>arrow_forward</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

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

  const [pricePerMeal, setPricePerMeal] = useState('');
  const [isVeg, setIsVeg] = useState(true);
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
        pricePerMeal: Number(pricePerMeal),
        veg: isVeg === 'true' || isVeg === true,
        diet: isVeg === 'true' || isVeg === true ? 'veg' : (isVeg === 'both' ? 'both' : 'nonveg'),
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
    <div className="onboarding-page">
      <Navbar />
      
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <div className="onboarding-icon-box">
              <span className="material-icons-round">
                {isOwner ? 'storefront' : 'how_to_reg'}
              </span>
            </div>
            <h1 className="onboarding-title">Complete your profile</h1>
            <p className="onboarding-subtitle">
              {isOwner 
                ? "Let's set up your mess partner account so customers can find you."
                : "Just a few more details so we can deliver your perfect meal."}
            </p>
          </div>

          {error && (
            <div className="onboarding-error">
              <span className="material-icons-round">error_outline</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="onboarding-form">
            {!isOwner && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="required-star">*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Default Delivery Address <span className="required-star">*</span>
                  </label>
                  <textarea 
                    className="input-field" 
                    placeholder="Flat No, Building, Street, Area"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Preference</label>
                  <select 
                    className="input-field"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
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
                <div className="form-group">
                  <label className="form-label">
                    Mess / Business Name <span className="required-star">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Sharmaji Ki Rasoi"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Owner / Business Phone <span className="required-star">*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    placeholder="Contact number for customers"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mess Location <span className="required-star">*</span>
                  </label>
                  <textarea 
                    className="input-field" 
                    placeholder="Full address of your mess kitchen"
                    rows="2"
                    value={messAddress}
                    onChange={(e) => setMessAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Cuisine Type</label>
                  <select 
                    className="input-field"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    <option value="north_indian">North Indian</option>
                    <option value="south_indian">South Indian</option>
                    <option value="maharashtrian">Maharashtrian</option>
                    <option value="bengali">Bengali</option>
                    <option value="mixed">Mixed / Pan-Indian</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Preference (Mess Type)</label>
                  <select 
                    className="input-field"
                    value={isVeg}
                    onChange={(e) => setIsVeg(e.target.value === 'true' ? true : (e.target.value === 'false' ? false : 'both'))}
                  >
                    <option value="true">Pure Vegetarian</option>
                    <option value="false">Non-Vegetarian</option>
                    <option value="both">Both (Veg & Non-Veg)</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Opening Time</label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Closing Time</label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Avg Price per Meal (₹) <span className="required-star">*</span>
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    className="input-field" 
                    placeholder="e.g. 120"
                    value={pricePerMeal}
                    onChange={(e) => setPricePerMeal(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mess Cover Photo (Recommended)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label className={`upload-dropzone ${imageUrl ? 'has-image' : ''}`}>
                      <span className="material-icons-round icon">
                        {uploading ? 'sync' : 'add_a_photo'}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)', fontWeight: 600 }}>
                        {uploading ? 'Uploading...' : 'Click to Upload Photo'}
                      </span>
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
                      <div className="preview-thumb">
                        <img src={imageUrl} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                    A good photo helps customers trust your mess.
                  </p>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn-onboarding-submit" 
              disabled={loading}
            >
              <span className="btn-text">
                {loading ? 'Saving Profile...' : 'Complete Registration'}
              </span>
              {!loading && <span className="material-icons-round icon">arrow_forward</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

import React, { useState, useEffect } from 'react';

const ProfileForm = ({ onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        profileImage: null,
        linkedinProfile: '',
        personalWebsite: '',
        organization: '',
        speakerBio: '',
        socialMediaHandle1:'',
        socialMediaHandle2:'',
        additionalInfo: ''
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.profile) {
            const sanitizeValue = (value) => (value === "null" || value == null ? "" : value);
    
            setFormData({
                profileImage: sanitizeValue(user.profile.profilePic),
                linkedinProfile: sanitizeValue(user.profile.linkedinProfile),
                personalWebsite: sanitizeValue(user.profile.personalWebsite),
                organization: sanitizeValue(user.profile.organization),
                speakerBio: sanitizeValue(user.profile.speakerBio),
                socialMediaHandle1: sanitizeValue(user.profile.socialMediaHandle1),
                socialMediaHandle2: sanitizeValue(user.profile.socialMediaHandle2),
                additionalInfo: sanitizeValue(user.profile.additionalInfo),
            });
    
            setPreview(sanitizeValue(user.profile.profilePic));
        }
    }, [user]);
    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, profileImage: null });
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formPayload = new FormData();
            if (formData.profileImage) {
                formPayload.append('profileImage', formData.profileImage);
            } else if (formData.profileImage === null) {
                formPayload.append('removeProfileImage', 'true');
            }
            // Append all fields, ensuring empty fields are sent as null
            Object.keys(formData).forEach(key => {
                if (key !== 'profileImage') {
                    formPayload.append(key, formData[key] !== "" ? formData[key] : null);
                }
            });
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
            const response = await fetch(`${apiUrl}/api/users/profile`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formPayload
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const updatedProfile = await response.json();
            onUpdate(updatedProfile);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white text-gray-800 rounded-xl p-6 max-h-[80vh] overflow-y-auto shadow-lg border border-blue-100">
                <h2 className="text-xl font-semibold border-b border-gray-200 pb-4">Update Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-50 border-4 border-blue-100 shadow-md">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-blue-500">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="profile-image" />
                            <label htmlFor="profile-image" className="px-4 py-2 bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors text-white shadow-sm">
                                Choose Profile Picture
                            </label>
                            {preview && (
                                <button type="button" onClick={handleRemoveImage} className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors shadow-sm">
                                    Remove Profile Picture
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <input type="url" placeholder="LinkedIn Profile URL" value={formData.linkedinProfile} onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700" />
                        <input type="url" placeholder="Personal Website URL" value={formData.personalWebsite} onChange={(e) => setFormData({ ...formData, personalWebsite: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700" />
                        <input type="text" placeholder="Organization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700" />
                        <textarea placeholder="Speaker Bio" value={formData.speakerBio} onChange={(e) => setFormData({ ...formData, speakerBio: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700 min-h-[100px]" />
                        <input type="url" placeholder="Social Media Handle (1)" value={formData.socialMediaHandle1} onChange={(e) => setFormData({ ...formData, socialMediaHandle1: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700" />
                        <input type="url" placeholder="Social Media Handle (2)" value={formData.socialMediaHandle2} onChange={(e) => setFormData({ ...formData, socialMediaHandle2: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700" />
                        <textarea placeholder="Additional Information" value={formData.additionalInfo} onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })} className="w-full p-3 bg-blue-50 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-blue-100 text-gray-700 min-h-[100px]" />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;

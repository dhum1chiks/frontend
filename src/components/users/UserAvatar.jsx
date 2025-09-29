import React from 'react';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const UserAvatar = ({ username, avatarUrl, size = 'w-10 h-10', textSize = 'text-base' }) => {
  let fullUrl = null;

  if (avatarUrl) {
    if (avatarUrl.startsWith('/uploads/avatars/')) {
      fullUrl = `${API_BASE_URL}${avatarUrl}`;
    } else {
      fullUrl = `${API_BASE_URL}/uploads/avatars/${avatarUrl}`;
    }

    // Debug log
    console.log("🔗 Final Avatar URL:", fullUrl);

    return (
      <img
        src={fullUrl}
        alt={username}
        className={`${size} rounded-full object-cover border-2 border-gray-200`}
        style={{ width: "100px", height: "100px" }}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold ${textSize}`}>
      {username ? username.charAt(0).toUpperCase() : '?'}
    </div>
  );
};

export default UserAvatar;

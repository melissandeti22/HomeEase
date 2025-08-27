import { jwtDecode } from 'jwt-decode';

export const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return jwtDecode(token); // { id, role, iat, exp }
  } catch (err) {
    return null;
  }
};

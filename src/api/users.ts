
import { API_BASE_URL } from "@/config/api";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  role_id: number;
  region_id: number;
  city: string;
  street: string;
  image: string | null;
  address: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// Fetch a specific user by ID
export const fetchUserById = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (userId: number, status: string, token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error updating user status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to update status for user with ID ${userId}:`, error);
    throw error;
  }
};

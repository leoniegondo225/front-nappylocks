
 export interface Employee {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "vacation";
  joinDate: string;
  salonId: string; 
  specialties: string[];
  avatar?: string;
}
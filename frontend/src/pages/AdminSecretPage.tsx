import { useNavigate } from "react-router-dom"; 
import { AdminPanel } from "@/components/AdminPanel"; 
 
const AdminSecretPage = () => { 
  const navigate = useNavigate(); 
 
  return ( 
    <AdminPanel 
      open={true} 
      onClose={() => navigate("/")} 
    /> 
  ); 
}; 
 
export default AdminSecretPage;

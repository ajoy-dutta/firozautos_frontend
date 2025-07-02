"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "../../../components/AxiosInstance";
import AddEditCustomerPage from "../../AddEditCustomerPage";
import { toast } from "react-hot-toast";

export default function EditCustomerPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axiosInstance.get(`/customers/${id}/`)
        .then(res => setInitialData(res.data))
        .catch(err => toast.error("Failed to load customer"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return <AddEditCustomerPage initialData={initialData} />;
}


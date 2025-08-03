import React, { useEffect, useState } from "react";
import axios from "axios";
import PetInfoCard from "./PetInfoCard";

const PetProfile = ({ petId }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/pets/${petId}/`)
      .then((response) => {
        setPet(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pet:", error);
        setLoading(false);
      });
  }, [petId]);

  if (loading) return <p>Loading...</p>;
  if (!pet) return <p>Pet not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PetInfoCard pet={pet} />
    </div>
  );
};

export default PetProfile;

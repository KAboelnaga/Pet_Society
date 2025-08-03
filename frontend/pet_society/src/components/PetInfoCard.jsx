import React from "react";

const PetInfoCard = ({ pet }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center">
      <img
        src={pet.avatar}
        alt={`${pet.name} avatar`}
        className="w-32 h-32 rounded-full object-cover mb-4"
      />
      <h2 className="text-2xl font-bold mb-1">{pet.name}</h2>
      <p className="text-gray-600">{pet.species} {pet.breed && `• ${pet.breed}`}</p>
      <p className="mt-2">{pet.age} years old • {pet.gender}</p>
      <p className="mt-4 text-center text-gray-700">{pet.description}</p>
    </div>
  );
};

export default PetInfoCard;

import { useState, useEffect } from "react";

const FilterForm = ({ filters, setFilters, setStudios }) => {
  useEffect(() => {
    fetch("http://localhost:5001/prixMinMax")
      .then((res) => res.json())
      .then((data) => setFilters((prev) => ({ ...prev, prixMin: data.prix_min, prixMax: data.prix_max })))
      .catch((err) => console.error("Erreur chargement prix min/max:", err));
  }, [setFilters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/reserv?prixMin=${filters.prixMin}&prixMax=${filters.prixMax}`);
      const data = await response.json();
      setStudios(data);
    } catch (err) {
      console.error("Erreur lors du filtrage :", err);
    }
  };

  return (
    <aside className="filter-sidebar">
      <h2>Filtrer les studios</h2>
      <form onSubmit={handleFilterSubmit}>
        <label>Prix minimum :</label>
        <input type="number" name="prixMin" value={filters.prixMin} onChange={handleFilterChange} step="1" min="0" />

        <label>Prix maximum :</label>
        <input type="number" name="prixMax" value={filters.prixMax} onChange={handleFilterChange} step="1" min="0"/>

        <button type="submit">Filtrer</button>
      </form>
    </aside>
  );
};

export default FilterForm;

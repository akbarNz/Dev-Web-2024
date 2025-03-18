const FilterForm = ({ filters, setFilters }) => {
    const handleFilterChange = (e) => {
      setFilters({ ...filters, [e.target.name]: e.target.value });
    };
  
    const handleFilterSubmit = (e) => {
      e.preventDefault();
      console.log("Filtres appliqués:", filters);
    };
  
    return (
      <aside className="filter-sidebar">
        <h2>Filtrer les studios</h2>
        <form onSubmit={handleFilterSubmit}>
          <label>Prix minimum :</label>
          <input type="number" name="prixMin" value={filters.prixMin} onChange={handleFilterChange} step="1" />
  
          <label>Prix maximum :</label>
          <input type="number" name="prixMax" value={filters.prixMax} onChange={handleFilterChange} step="1" />
  
          <label>Note moyenne minimum</label>
          <input type="number" name="noteMin" value={filters.noteMin} onChange={handleFilterChange} step="0.5" max="5" min="0" />
  
          <label>Note moyenne maximum</label>
          <input type="number" name="noteMax" value={filters.noteMax} onChange={handleFilterChange} step="0.5" max="5" min="0" />
  
          <button type="submit">Filtrer</button>
        </form>
      </aside>
    );
  };
  
  export default FilterForm;
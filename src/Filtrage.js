import { useState, useEffect } from "react";
import MultiRangeSlider from "multi-range-slider-react";
import Rating from '@mui/material/Rating';

const FilterForm = ({ filters, setFilters}) => {
  const [minValue, set_minValue] = useState(null);
  const [maxValue, set_maxValue] = useState(null);
  const [minInit, set_minInit] = useState(null);
  const [maxInit, set_maxInit] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/prixMinMax")
      .then((res) => res.json())
      .then((data) => {
        set_minInit(data.prix_min);
        set_maxInit(data.prix_max);
        set_minValue(data.prix_min);
        set_maxValue(data.prix_max);
        setFilters((prev) => ({ ...prev, prixMin: data.prix_min, prixMax: data.prix_max }));
      })
      .catch((err) => console.error("Erreur au chargement de prix min et max:", err));
  }, [setFilters]);

  const handleInput = (e) => {
    set_minValue(e.minValue);
    set_maxValue(e.maxValue);
    setFilters((prev) => ({
      ...prev,
      prixMin: e.minValue,
      prixMax: e.maxValue,
    }));
  };

  const handleRating = (event, newValue) => {
    setFilters((prev) => ({
      ...prev,
      noteMin: newValue,
    }));
  };

  return (
    <aside className="filter-sidebar">
      <h2 className="titreFiltre">Filtrer les studios</h2>
      <div className="App">
        <MultiRangeSlider
          min={minInit}
          max={maxInit}
          step={1}
          minValue={minValue}
          maxValue={maxValue}
          onInput={handleInput}
          style={{ border: "none", boxShadow: "none", padding: "15px 10px" }}
          barLeftColor="white"
          barInnerColor="blue"
          barRightColor="white"
          thumbLeftColor="blue"
          thumbRightColor="blue"
          ruler="false"
          label="false"
        />
      </div>
      <div className="divOutput">
          <div>
            <span>{minValue} €</span>
            <span>{maxValue} €</span>
          </div>
      </div>
      <div className="ratingStar">
        <Rating 
          name="half-rating"
          size="large" 
          onChange={handleRating}
          defaultValue={0} 
          precision={0.5} />
      </div>    
    </aside>
  );
};

export default FilterForm;

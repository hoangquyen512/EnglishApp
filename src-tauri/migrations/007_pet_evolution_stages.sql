CREATE TABLE pet_evolution_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL REFERENCES pet_species(id),
  stage_order INTEGER NOT NULL,
  min_level INTEGER NOT NULL,
  sprite_key TEXT NOT NULL
);

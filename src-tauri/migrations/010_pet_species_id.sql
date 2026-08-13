ALTER TABLE pet_state ADD COLUMN species_id INTEGER REFERENCES pet_species(id);

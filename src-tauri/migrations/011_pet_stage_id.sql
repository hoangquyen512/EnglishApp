ALTER TABLE pet_state ADD COLUMN current_stage_id INTEGER REFERENCES pet_evolution_stages(id);

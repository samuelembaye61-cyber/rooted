-- Optional map position, looked up once by the server when an event is saved.
ALTER TABLE events
  ADD COLUMN latitude double precision CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  ADD COLUMN longitude double precision CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  ADD CONSTRAINT events_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL));

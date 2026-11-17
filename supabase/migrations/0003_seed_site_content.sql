insert into site_content (key, value) values
  ('nosotros_titulo', 'Sobre EFA Voley Club'),
  ('nosotros_cuerpo', 'Eso Fue Adentro nació como un club de la comunidad, para quienes quieren jugar vóley por el simple gusto de jugar. Creemos que practicar deporte no debería tener edad: por eso abrimos la cancha tanto a jóvenes como a adultos que no encuentran dónde jugar. Aquí no exigimos alto rendimiento; buscamos movernos, compartir y disfrutar este deporte en comunidad.')
on conflict (key) do nothing;

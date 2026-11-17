insert into site_content (key, value) values
  ('nosotros_titulo', 'Sobre EFA Voley Club'),
  ('nosotros_cuerpo', 'Eso Fue Adentro nace de la pasión por el vóley y la convicción de que cada punto se juega al límite. Formamos jugadoras y jugadores dentro y fuera de la cancha, con disciplina, comunidad y juego competitivo.')
on conflict (key) do nothing;

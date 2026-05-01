-- =====================================================================
-- Seed milestone_templates with the WHO/CDC "Learn the Signs. Act Early"
-- short list. Codes are stable identifiers; the app resolves localized
-- titles and descriptions from i18n keys (`milestones.tpl.<code>.title`).
-- The English `title` / `description` columns are kept as a fallback so
-- the table is self-explanatory in the dashboard.
-- =====================================================================

insert into public.milestone_templates
  (code, title, description, category, expected_age_min_months, expected_age_max_months)
values
  ('social_smile',     'Smiles at people',                'Reacts to faces and voices with a social smile.',                              'social',    1, 2),
  ('motor_head_lift',  'Lifts head briefly',              'When on tummy, lifts head and turns it side to side.',                        'motor',     1, 3),
  ('motor_head_steady','Holds head steady',               'Keeps head upright when supported in a sitting position.',                    'motor',     3, 4),
  ('social_laugh',     'Laughs out loud',                 'Laughs in response to play or funny faces.',                                  'social',    3, 5),
  ('lang_babble',      'Coos and babbles',                'Makes vowel sounds and repetitive consonant strings ("ba-ba", "ga-ga").',     'language',  3, 6),
  ('motor_rolls',      'Rolls over both ways',            'Rolls front-to-back and back-to-front.',                                      'motor',     5, 7),
  ('motor_sits',       'Sits without support',            'Holds a sitting position without using hands for balance.',                   'motor',     6, 9),
  ('motor_crawls',     'Crawls or scoots',                'Moves across the floor on hands and knees, or by scooting.',                  'motor',     7, 10),
  ('lang_dada',        'Says "mama" / "dada"',            'Babbles "mama" or "dada" — meaning comes a bit later.',                       'language',  8, 12),
  ('social_peekaboo',  'Plays peek-a-boo',                'Engages in simple back-and-forth games like peek-a-boo or pat-a-cake.',       'social',    8, 12),
  ('motor_stands',     'Stands alone briefly',            'Stands without holding onto anything for a few seconds.',                     'motor',     9, 14),
  ('social_waves',     'Waves bye-bye',                   'Waves or claps in greetings and farewells.',                                  'social',    9, 14),
  ('self_cup',         'Drinks from a cup',               'Drinks from an open or sippy cup with help.',                                 'motor',     12, 18),
  ('motor_walks',      'Takes first steps',               'Walks a few steps independently.',                                            'motor',     12, 15),
  ('lang_first_word',  'First word with meaning',         'Uses a word like "mama" / "dada" or another word for a specific person/thing.', 'language', 12, 15),
  ('cog_points',       'Points to objects',               'Points to body parts, pictures or objects when named.',                       'cognitive', 14, 20),
  ('motor_runs',       'Runs steadily',                   'Runs without falling on most attempts.',                                      'motor',     18, 24),
  ('lang_two_words',   'Combines two words',              'Joins two words into a phrase ("more milk", "go car").',                      'language',  18, 24)
on conflict (code) do nothing;

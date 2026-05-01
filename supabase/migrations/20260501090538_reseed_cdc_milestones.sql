-- =====================================================================
-- Replace the curated 18-item seed with the full CDC "Learn the Signs.
-- Act Early" checkpoint list (2/4/6/9/12/15/18/24 months) across the
-- four CDC categories: Social/Emotional, Language/Communication,
-- Cognitive, Movement/Physical. Codes follow the pattern
-- `<short-category><checkpoint>_<keyword>` so they are easy to scan in
-- the dashboard. The English title/description columns are kept as a
-- fallback; the app reads localized strings via `milestones.tpl.<code>`.
-- =====================================================================

-- Drop any existing achievements that reference the old template ids
-- and clear the templates table before reseeding so the constraint
-- holds even if we change codes.
delete from public.milestones where template_id is not null;
delete from public.milestone_templates;

insert into public.milestone_templates
  (code, title, description, category, expected_age_min_months, expected_age_max_months)
values
  -- ============================== 2 months ==============================
  ('s2_smile',          'Smiles at people',                 'Reacts to faces and voices with a social smile.',                            'social',    1,  2),
  ('s2_calms',          'Calms when held',                  'Calms down when picked up, talked to or held.',                              'social',    1,  2),
  ('l2_sounds',         'Makes sounds besides crying',      'Makes cooing or gurgling sounds.',                                           'language',  1,  2),
  ('m2_head_tummy',     'Lifts head briefly on tummy',      'When on tummy, lifts head and turns it side to side.',                       'motor',     1,  2),
  ('c2_watches',        'Watches you move',                 'Follows you with eyes when you move nearby.',                                'cognitive', 1,  2),

  -- ============================== 4 months ==============================
  ('s4_laughs',         'Laughs out loud',                  'Laughs in response to play or funny faces.',                                 'social',    2,  4),
  ('s4_seeks_attention','Seeks attention',                  'Smiles or moves to get attention from familiar adults.',                     'social',    2,  4),
  ('l4_coos',           'Coos and babbles',                 'Makes vowel sounds ("oooh", "aaah") and babbles back when talked to.',       'language',  2,  4),
  ('l4_turns_voice',    'Turns toward voices',              'Turns head to find the source of a familiar voice.',                         'language',  2,  4),
  ('m4_head_steady',    'Holds head steady',                'Keeps head upright when supported in a sitting position.',                   'motor',     2,  4),
  ('m4_holds_toy',      'Holds a toy',                      'Holds a toy when it is placed in their hand.',                               'motor',     2,  4),
  ('m4_push_up',        'Pushes up on elbows',              'When on tummy, pushes up on forearms.',                                      'motor',     2,  4),

  -- ============================== 6 months ==============================
  ('s6_knows_people',   'Recognizes familiar people',       'Knows familiar faces and reacts differently than to strangers.',             'social',    4,  6),
  ('l6_raspberries',    'Blows raspberries',                'Blows raspberries and makes squealing or back-and-forth sounds.',            'language',  4,  6),
  ('m6_rolls',          'Rolls both ways',                  'Rolls front-to-back and back-to-front.',                                     'motor',     4,  6),
  ('m6_lean_sit',       'Sits leaning on hands',            'Holds a sitting position with hands as support.',                            'motor',     4,  6),
  ('c6_reaches',        'Reaches for objects',              'Reaches for and grabs nearby toys.',                                         'cognitive', 4,  6),
  ('c6_mouths',         'Mouths objects to explore',        'Puts things in mouth to explore textures and shapes.',                       'cognitive', 4,  6),

  -- ============================== 9 months ==============================
  ('s9_clingy',         'Shy or clingy with strangers',     'Sticks close to familiar adults; warms up slowly to new people.',            'social',    6,  9),
  ('s9_peekaboo',       'Plays peek-a-boo',                 'Engages in simple back-and-forth games like peek-a-boo or pat-a-cake.',      'social',    6,  9),
  ('l9_babble_strings', 'Repetitive babble',                'Strings sounds together: "mamamama", "bababa".',                             'language',  6,  9),
  ('l9_responds_name',  'Responds to own name',             'Looks toward you when name is called.',                                      'language',  6,  9),
  ('m9_sits_alone',     'Sits without support',             'Holds a sitting position without using hands for balance.',                  'motor',     6,  9),
  ('m9_crawls',         'Crawls or scoots',                 'Moves across the floor on hands and knees, or by scooting.',                 'motor',     6,  9),
  ('c9_finds_partly',   'Looks for objects out of sight',   'Searches for things they saw being hidden.',                                 'cognitive', 6,  9),
  ('c9_bangs_objects',  'Bangs two objects together',       'Holds one toy in each hand and bangs them together.',                        'cognitive', 6,  9),

  -- ============================== 12 months =============================
  ('s12_pat_a_cake',    'Plays games like pat-a-cake',      'Joins in for back-and-forth games and turn-taking.',                         'social',    9,  12),
  ('l12_waves',         'Waves bye-bye',                    'Waves or claps in greetings and farewells.',                                 'language',  9,  12),
  ('l12_first_word',    'First word with meaning',          'Calls a parent "mama" / "dada" or another word for a specific person/thing.','language',  9,  12),
  ('l12_understands_no','Understands "no"',                 'Pauses or stops a behaviour when told "no".',                                'language',  9,  12),
  ('m12_pulls_to_stand','Pulls to stand',                   'Pulls up to a standing position holding furniture.',                         'motor',     9,  12),
  ('m12_cruises',       'Cruises holding furniture',        'Walks sideways while holding onto furniture.',                               'motor',     9,  12),
  ('m12_pincer',        'Picks up with pincer grasp',       'Picks up small things between thumb and forefinger.',                        'motor',     9,  12),
  ('c12_finds_hidden',  'Finds hidden objects',             'Looks under a cup or blanket for a toy hidden there.',                       'cognitive', 9,  12),

  -- ============================== 15 months =============================
  ('s15_copies_kids',   'Copies other children',            'Watches other children playing and copies what they do.',                    'social',    12, 15),
  ('s15_affection',     'Shows affection',                  'Hugs stuffed animals, dolls, or familiar people.',
   'social',    12, 15),
  ('l15_few_words',     'Says a few words',                 'Tries to say one or two words besides "mama" / "dada".',                     'language',  12, 15),
  ('m15_first_steps',   'Takes a few steps alone',          'Walks several steps without holding onto anything.',                         'motor',     12, 15),
  ('m15_finger_food',   'Feeds self finger food',           'Picks up food and brings it to mouth with fingers.',                         'motor',     12, 15),
  ('c15_uses_objects',  'Uses everyday objects correctly',  'Pretends to talk on a phone, drink from an empty cup, page through a book.', 'cognitive', 12, 15),

  -- ============================== 18 months =============================
  ('s18_points_interest','Points to show interest',         'Points to objects to share what they notice.',                               'social',    15, 18),
  ('s18_helps_undress', 'Helps with undressing',            'Holds out arms or pulls off socks when getting undressed.',                  'social',    15, 18),
  ('l18_three_words',   'Says three or more words',         'Tries to say at least three words besides "mama" / "dada".',                 'language',  15, 18),
  ('l18_follows_steps', 'Follows simple directions',        'Follows a one-step direction without gestures ("Give it to me").',           'language',  15, 18),
  ('m18_walks',         'Walks without holding',            'Walks steadily without holding onto a person or object.',                    'motor',     15, 18),
  ('m18_scribbles',     'Scribbles',                        'Makes marks on paper with a crayon.',                                        'motor',     15, 18),
  ('m18_climbs',        'Climbs on and off furniture',      'Climbs on and off a couch or chair without help.',                           'motor',     15, 18),
  ('c18_pretend_play',  'Imitates chores',                  'Pretends to do chores like sweeping or cooking.',                            'cognitive', 15, 18),

  -- ============================== 24 months =============================
  ('s24_notices_others','Notices others'' feelings',        'Looks to see how others feel and reacts to upset friends.',                  'social',    18, 24),
  ('l24_two_words',     'Combines two words',               'Joins two words into a phrase ("more milk", "go car").',                     'language',  18, 24),
  ('l24_points_book',   'Points to things in book',         'Points to pictures when asked ("Where is the bear?").',                      'language',  18, 24),
  ('l24_body_parts',    'Points to body parts',             'Points to at least two body parts when named.',                              'language',  18, 24),
  ('m24_runs',          'Runs steadily',                    'Runs without falling on most attempts.',                                     'motor',     18, 24),
  ('m24_kicks',         'Kicks a ball',                     'Kicks a ball forward.',                                                      'motor',     18, 24),
  ('m24_stairs',        'Walks up stairs with help',        'Walks up a few stairs holding a hand or rail.',                              'motor',     18, 24),
  ('m24_spoon',         'Eats with a spoon',                'Uses a spoon to eat, with some spilling.',                                   'motor',     18, 24),
  ('c24_plays_two_toys','Plays with multiple toys',         'Plays with more than one toy at a time (puts blocks in a truck).',           'cognitive', 18, 24);

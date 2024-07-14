import pandas as pd

# Load the dataset
file_path = './nba_2022-23_all_stats_with_salary.csv'
data = pd.read_csv(file_path)

# Dictionary to map players to their final teams
player_final_teams = {
    'Dewayne Dedmon': 'PHI',
    'Dario Saric': 'OKC',
    'Kevin Knox II': 'POR',
    'Mason Plumlee': 'LAC',
    'Jae Crowder': 'MIL',
    'Patrick Beverley': 'CHI',
    'Reggie Jackson': 'DEN',
    'Will Barton': 'TOR',
    'Danny Green': 'CLE',
    'Josh Richardson': 'NOP',
    'Kendrick Nunn': 'WAS',
    'Rui Hachimura': 'LAL',
    'Jalen McDaniels': 'PHI',
    'Cam Reddish': 'POR',
    'Matisse Thybulle': 'POR',
    'Gary Payton II': 'GSW',
    'Thomas Bryant': 'DEN',
    'Mike Muscala': 'BOS',
    'Sviatoslav Mykhailiuk': 'CHA',
    'Justin Holiday': 'DAL',
    'Eric Gordon': 'LAC',
    'Frank Kaminsky III': 'HOU',
    'Kevin Durant': 'PHX',
    'Kyrie Irving': 'DAL',
    'Josh Hart': 'NYK',
    'James Wiseman': 'DET',
    'Luke Kennard': 'MEM',
    'Russell Westbrook': 'LAC',
    'Serge Ibaka': 'MIL',
    'Terrence Ross': 'PHX',
        'Malik Beasley': 'LAL',
    'Dorian Finney-Smith': 'BRK',
    'Mo Bamba': 'LAL',
    'Jakob Poeltl': 'TOR',
    'Nerlens Noel': 'DET',
    'Cameron Johnson': 'BRK',
    'Goga Bitadze': 'ORL',
    'Nickeil Alexander-Walker': 'MIN',
    'Jarred Vanderbilt': 'LAL',
    'Darius Bazley': 'PHO',
    'George Hill': 'IND',
    'Kevin Knox': 'POR',
    'Saddiq Bey': 'ATL',
    'Markieff Morris': 'DAL',
    'Jordan Nwora': 'IND',
    'Bruno Fernando': 'ATL',
    'Frank Kaminsky': 'ATL',
    'Damian Jones': 'UTA',
    'Saben Lee': 'PHO',
    'Bones Hyland': 'LAC',
    'Juan Toscano-Anderson': 'UTA',
    'Garrison Mathews': 'ATL',
    'Davon Reed': 'LAL',
    'Ryan Arcidiacono': 'POR',
    'Terry Taylor': 'CHI',
    'Kessler Edwards': 'SAC',
    'Sandro Mamukelashvili': 'SAS',
    'Eugene Omoruyi': 'OKC',
    'Justin Champagnie': 'TOR',
    'Moses Brown': 'LAC',
    'Matt Ryan': 'MIN',
    'Julian Champagnie': 'SAS',
    'Dru Smith': 'MIA',
    'Jamaree Bouyea': 'WAS'
}

# Update the team information
data['Team'] = data.apply(lambda row: player_final_teams.get(row['Player Name'], row['Team']), axis=1)

# Save the updated dataset
updated_file_path = './nba_2022-23_all_stats_with_salary_updated.csv'
data.to_csv(updated_file_path, index=False)

print(f"Updated dataset saved to {updated_file_path}")

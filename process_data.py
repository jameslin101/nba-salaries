import pandas as pd

# Load the NBA salaries data
nba_salaries_df = pd.read_csv('./Nba Player Salaries.csv')

# Filter the data for the 2022/2023 season
salaries_2022_2023 = nba_salaries_df[['Player Name', '2022/2023']]

# Save the filtered data to a new CSV file
salaries_2022_2023.to_csv('./nba_salaries_2022_2023.csv', index=False)

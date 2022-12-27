import csv
import os
import re

def parse_csv_files(search_word, new_search_word, newer_search_word, directory):
    # Read the list of files in the directory
    files = os.listdir(directory)

    # Initialize an array to store the header row
    header_row = []
    # Initialize an array to store the rows that meet the search criteria
    new_rows = []
    # Initialize a counter
    i = 0

    # Iterate through the list of files in the directory
    for file in files:
        i += 1
        # Read the .cvs file
        with open(f"{directory}/{file}", "r") as csv_file:
            reader = csv.reader(csv_file)

            # Find the header row
            for row_number, row in enumerate(reader):
                if row_number == 0:
                    header_row.append(["Mac Address"] + row)
                # Find the mac address
                mac_regex = re.compile(r"([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})")
                mac_address = mac_regex.search(str(row))
                if mac_address:
                    mac_address = mac_address.group(0)
                    # Iterate through the rows and find the search words
                    for row_number, row in enumerate(reader):
                        regex_first = re.compile(search_word, re.IGNORECASE)
                        if regex_first.search(str(row)):
                            regex_second = re.compile(new_search_word, re.IGNORECASE)
                            if regex_second.search(str(row)):
                                regex_third = re.compile(newer_search_word)
                                if regex_third.search(str(row)):
                                    # If search words are found, add the row to the new_rows array
                                    new_rows.append([mac_address] + row)

    # Create a new .csv file and write the new rows to it
    with open("new_file.csv", "w", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(header_row[0])
        writer.writerows(new_rows)

# Prompt the user for the search word variables
def prompt(question):
    return input(question)

search_word = prompt("Enter the first search word: ")
new_search_word = prompt("Enter the second search word: ")
newer_search_word = prompt("Enter the third search word. tHiRd SeArCh WoRd Is CaSe SeNsItIvE: ")
directory = prompt("Enter the directory path: ")

# Call the parse_csv_files function with the search word Prompt variables
parse_csv_files(search_word, new_search_word, newer_search_word, directory)

# Call the parse_csv_files function with the search word parameters
# parse_csv_files("papa", "money", "average", "/Users/thetrekman/Documents/Code/csv-parser/Docs")

#Reads the list of files in the specified directory, reads each .csv file, searches for rows that contain the search word, and then checks if the row also contains the new search word. If it does, the row is added to an array. After all files have been processed, a new .csv file is created and the rows that contain all the search words are written to it.

#!/usr/bin/python3

from bs4 import BeautifulSoup
import json
import csv
import re


class EasyDict(dict):
    """
    Wrapper over dict so we can get a value as attribute
    Like map.name = "Mike" not just map["name"] = Mike
    Also, missing KEYS are returned as None instead of raising Exception
    """

    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            return None

    def __setattr__(self, key, value):
        self[key] = value


HAM_TXT_PATH = [
    # "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_1.txt",
    # "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_2.txt",
    # "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_1_PRINT.txt",
    "/mnt/c/Users/amogoi/Downloads/HAMOND 1 The Homebrewery - NaturalCrit.html",
]

OUT_HARVEST_CSV_PATH = "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_HARVESTS.csv"
OUT_TRINKETS_CSV_PATH = "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_TRINKETS.csv"
OUT_ITEMS_CSV_PATH = "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_ITEMS.csv"
ALL_AS_JSON = "/mnt/c/Users/amogoi/Downloads/HAMUND_BOOK_ALLL.json"


def html_book_data(book_path):
    with open(book_path, "r") as f:
        contents = f.read()
        return BeautifulSoup(contents, 'lxml')


DROP_HEADER_LIST = sorted(
    ["DC", "Item", "Description", "Value", "Weight", "Crafting", ])
REAL_HEADER_LIST = []

print("DROP_HEADER_LIST : ", DROP_HEADER_LIST)


def flattte_white(cell_test):
    for i in range(20):
        cell_test = cell_test.replace("\t\t", " ")
        cell_test = cell_test.replace("\t", " ")
    for i in range(20):
        cell_test = cell_test.replace("\n", " ")
    for i in range(20):
        cell_test = cell_test.replace("    ", " ")
        cell_test = cell_test.replace("  ", " ")

    return cell_test


def extract_harvests_csv(soup):
    global REAL_HEADER_LIST
    tables = soup.findAll("table")

    data_ = EasyDict()
    data_.elements = []

    for table in tables:
        # print("\n\n")

        tr_raw_ = list(filter(bool, table.thead.tr.text.splitlines()))
        all_tr = sorted(tr_raw_)
        if DROP_HEADER_LIST != all_tr:
            print("other all_tr : ", all_tr)
            continue

        REAL_HEADER_LIST = tr_raw_
        prev_header = table.findPrevious(["h1", "h2", "h3", "h4", "h5", "h6"])
        # print("prev_header : " , prev_header)

        element = EasyDict()

        element.id = prev_header["id"]
        element.name = prev_header.text
        element.table = []

        if "tarrasque-cont-" == element.id :
            element = data_.elements.pop()

        fin_table = []
        trows = table.tbody.findChildren("tr")
        for trow in trows:
            tab_row = []
            tcols = trow.findChildren("td")
            # all_cols = list(filter(bool, tcols.text.splitlines()))
            # print("COL : " , tcols)

            extra_req = None

            for tcol in tcols:
                # print("tcols : " , tcols)
                cell_test = tcol.text
                # print("cell_test : " , cell_test)

                try_req_list = tcol.findAll("strong")
                for try_req in try_req_list  :
                    reqtxt = flattte_white(try_req.text)
                    if str(reqtxt).startswith("Requires ") :
                        reqtxt = reqtxt.replace("Requires ","")
                        reqtxt = reqtxt.replace(".","")
                        print("reqtxt : ", reqtxt)
                        extra_req = reqtxt

                cell_test = flattte_white(cell_test)

                tab_row.append(cell_test)

            if len(tab_row) < 4:
                print("NOT WNOUGH DATA")
                print("trow : ", str(trow).replace("\n", " "))
                print("tab_row : ", tab_row)
                continue
            tab_row.extend(["","","","",""])

            row_misc = ""
            row_name = tab_row[1]
            row_descr = tab_row[2]

            if not extra_req :
                if re.search('\(\d* ?vials?\)', row_name, re.IGNORECASE) :
                    extra_req = "vial"


            Multiplier = 1

            multi_look_vial = re.search('\((\d+)\s+vials\)', row_name, re.IGNORECASE)
            if multi_look_vial:
                print("multi_look_vial : ", multi_look_vial )
                row_name = row_name.replace(multi_look_vial.group(0),"").strip()
                row_misc += " " + str(multi_look_vial.group(0))
                Multiplier = int(multi_look_vial.group(1))

            if "(vial)" in row_name:
                row_name = row_name.replace("(vial)","").strip()
                row_misc += " " + "(vial)"
                Multiplier = 1


            multi_look_cnt = re.search('\(x(\d+)\)', row_name, re.IGNORECASE)
            if multi_look_cnt:
                print("multi_look_cnt : ", multi_look_cnt )
                row_name = row_name.replace(multi_look_cnt.group(0),"").strip()
                row_misc += " " + str(multi_look_cnt.group(0))
                Multiplier = int(multi_look_cnt.group(1))




            valueNumber = str(tab_row[3].replace(",","").replace(".","").strip())
            if "gp" in str(valueNumber) : valueNumber = int(valueNumber.replace("gp","").strip())
            if "sp" in str(valueNumber) : valueNumber = int(valueNumber.replace("sp","").strip()) / 10.0
            if "cp" in str(valueNumber) : valueNumber = int(valueNumber.replace("cp","").strip()) / 100.0

            weightNumber = str(tab_row[4].replace(",","").replace(".","").strip())
            if "lb" in str(weightNumber) : weightNumber = int(weightNumber.replace("lb","").strip())

            tab_row[1] = row_name
            tab_row[2] = row_descr

            tab_row = tab_row[:len(REAL_HEADER_LIST)]
            tab_row.append(extra_req)
            tab_row.append(valueNumber)
            tab_row.append(weightNumber)
            tab_row.append(Multiplier)
            tab_row.append(row_misc)

            tab_row.append( tab_row.pop(2) )

            fin_table.append(tab_row)

        # print("TABLEEEEEEEEE : ",json.dumps(fin_table, indent=2, sort_keys=True))
        element.table.extend(fin_table)

        # print("element : ",json.dumps(element, indent=2, sort_keys=True))
        data_.elements.append(element)

    data_.header = ["DC", "Item", "Description", "Value", "Weight", "Crafting", ]
    data_.header.append("Requires")
    data_.header.append("ValueNumber")
    data_.header.append("WeightNumber")
    data_.header.append("Multiplier")
    data_.header.append("Misc")

    data_.header.append( data_.header.pop(2) )

    data_.csv_out = OUT_HARVEST_CSV_PATH


    write_elem_csv(data_)
    return data_


def write_elem_csv(ents_):
    harvest_out_matrix = []
    header = ["ID", "Name"]
    print("ents_.header : ", ents_.header)
    header.extend(ents_.header)
    harvest_out_matrix.append(header)

    for elem_ in ents_.elements:
        eid = elem_.id
        ename = elem_.name
        for drop_ in elem_.table:
            row = [eid, ename]
            row.extend(drop_)
            # print(row)
            # print(drop_)
            harvest_out_matrix.append(row)

    with open(ents_.csv_out, mode='w') as harv_file:
        file_writer = csv.writer(
            harv_file, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for line in harvest_out_matrix:
            file_writer.writerow(line)

    # print("harvest_out_matrix : ",json.dumps(harvest_out_matrix[:5], indent=2, sort_keys=True))




def extract_trinkets_csv(soup):
    tables = soup.findAll("table")

    data_ = EasyDict()
    data_.elements = []
    data_.header_fake = ["Item", "Value", "Weight"]
    data_.header = ["roll d8","Item", "Value", "Weight"]

    for table in tables:
        tr_raw_ = list(filter(bool, table.thead.tr.text.splitlines()))

        if data_.header_fake != tr_raw_:
            continue

        prev_header = table.findPrevious(["h1", "h2", "h3", "h4", "h5", "h6"])
        # print("prev_header : " , prev_header)
        element = EasyDict()
        element.raw_name = prev_header.text
        element.raw_id = prev_header["id"]
        element.name = prev_header.text.replace(" Trinket Table", "")
        element.id = prev_header["id"].replace("-trinket-table", "")
        element.table = []
        # print("  tr_raw_  ", tr_raw_)
        # print("  element  ", element)
        trows = table.tbody.findChildren("tr")
        for trow in trows:
            tab_row = []
            tcols = trow.findChildren("td")
            # print("  tcols  ", tcols)
            for tcol in tcols:
                cell_test = tcol.text
                tab_row.append(cell_test)


            # print("tab_row : ", tab_row)


            valueNumber = str(tab_row[2].replace(",","").replace(".","").strip())
            if "gp" in str(valueNumber) : valueNumber = int(valueNumber.replace("gp","").strip())
            elif "sp" in str(valueNumber) : valueNumber = int(valueNumber.replace("sp","").strip()) / 10.0
            elif "cp" in str(valueNumber) : valueNumber = int(valueNumber.replace("cp","").strip()) / 100.0

            weightNumber = str(tab_row[3].replace(",","").replace(".","").strip())
            if "/" in str(weightNumber) : weightNumber = weightNumber.replace("lb","").strip()
            elif "lb" in str(weightNumber) : weightNumber = int(weightNumber.replace("lb","").strip())

            tab_row.append(valueNumber)
            tab_row.append(weightNumber)

            # tab_row.append( tab_row.pop(1) )

            element.table.append(tab_row)

        data_.elements.append(element)

    data_.csv_out = OUT_TRINKETS_CSV_PATH


    # data_.header.append( data_.header.pop(1) )
    data_.header.append("ValueNumber")
    data_.header.append("WeightNumber")

    write_elem_csv(data_)
    return data_

def extract_items_csv(soup):
    # <h1 id="craftable-items-a-z">Craftable Items A-Z</h1>
    item_start = soup.find("h1", text = "Craftable Items A-Z")

    print("  item_start  ", item_start)



    data_ = EasyDict()
    data_.elements = []
    data_.header = ["Description"]

    itlist = item_start.findAllNext(["h1","h4", "p", "ul"])
    # itlist = item_start.findAllNext(["h4"])

    cur_item_ = None
    for it_ in itlist :

        # print("     it_  ", type(it_))
        # print("     it_  ", dir(it_))
        if it_.name == "h4" :
            # print("\n  it_  ", it_)
            if cur_item_ :
                data_.elements.append(cur_item_)

            cur_item_ = EasyDict()
            cur_item_.name = it_.text
            cur_item_.id = it_["id"]
            cur_item_.table = [[""]]

        elif it_.name == "h1" :

            data_.elements.append(cur_item_)

            break

        elif cur_item_ :
            cell_test = it_.text
            cell_test = flattte_white(cell_test)

            # print("  cell_test  ", cell_test)

            cur_item_.table[0][0] += cell_test

    data_.csv_out = OUT_ITEMS_CSV_PATH
    write_elem_csv(data_)

    data_.elements = data_.elements

    # print("data_ : ",json.dumps(data_, indent=2, sort_keys=True))
    return data_




for book_path in HAM_TXT_PATH:
    print("\n\n\n\n\n")
    soup = html_book_data(book_path)
    extract_harvests = extract_harvests_csv(soup)
    extract_trinkets = extract_trinkets_csv(soup)
    extract_items = extract_items_csv(soup)

    add_data = EasyDict()
    add_data.harvests = extract_harvests
    add_data.trinkets = extract_trinkets
    add_data.items = extract_items
    with open(ALL_AS_JSON, mode='w') as harv_file:
        json.dump(add_data,harv_file, indent=2)

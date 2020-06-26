
function cust_sign(val_) {
    val_ = parseFloat(val_)
    if (val_ < 0)
        return -1
    else if (val_ > 0)
        return 0
    else
        return 1

}


/*

CONFIG :
Write config in the cell to the right to alter the output

NOZERO - hides rows with 0 count
sort 6 r1 a2 n5 s4 S3
    - #    number of column to sort
    - 3 1  sort column 3 then 1
    - r#   reverse the sort
    - a#   absolute (Math.abs) sort
    - n#   force to number
    - S#   number as Math.sign output
    - s#   similar to S, but order is Negative, Positive, Zero
"sort #s" is ideal to have negative count items at the top, then regular items and then the items you do not have


*/
function inventory_to_output(inventory, config, header, output) {

    for (const [key_, object_] of Object.entries(inventory)) {
        var table_row = []


        if (config.includes("NOZERO") && object_.count == 0) continue

        normal_array(header).forEach(function (header_val) {
            var cell_value = ""

            if (header_val in object_)
                cell_value = String(object_[header_val])
            if (header_val == "json_")
                cell_value = JSON.stringify([key_, object_])
            if (header_val == "key_")
                cell_value = String(key_)

            table_row.push(cell_value)
        })

        output.push(table_row)
    }


    var sort_cfg_full = config.match(/sort(?:\s+\w*\d+)+/)
    if (sort_cfg_full) {
        var sort_cfg_list = sort_cfg_full[0].split(/\s|\n/g).map(word => word.trim()).filter(word => word.length > 0)
        sort_cfg_list.shift()
        for (const srt of sort_cfg_list) {
            var ipl = parseInt(srt.match(/\d+/)[0]) - 1
            // output.push(["ipl", ipl]);

            if (srt.includes("a"))
                output.sort((a, b) => (Math.abs(a[ipl]) > Math.abs(b[ipl])) ? -1 : ((Math.abs(b[ipl]) > Math.abs(a[ipl])) ? 1 : 0))
            else if (srt.includes("n"))
                output.sort((a, b) => (parseFloat(a[ipl]) > parseFloat(b[ipl])) ? -1 : ((parseFloat(b[ipl]) > parseFloat(a[ipl])) ? 1 : 0))
            else if (srt.includes("s"))
                output.sort((a, b) => (cust_sign(a[ipl]) > cust_sign(b[ipl])) ? -1 : ((cust_sign(b[ipl]) > cust_sign(a[ipl])) ? 1 : 0))
            else if (srt.includes("S"))
                output.sort((a, b) => (Math.sign(a[ipl]) > Math.sign(b[ipl])) ? -1 : ((Math.sign(b[ipl]) > Math.sign(a[ipl])) ? 1 : 0))
            else
                output.sort((a, b) => (a[ipl] > b[ipl]) ? -1 : ((b[ipl] > a[ipl]) ? 1 : 0))

            if (!srt.includes("r")) output.reverse()
        }

        // output.push(["sort_cfg_full", JSON.stringify(sort_cfg_full)]);
        // output.push(["sort_cfg_list", JSON.stringify(sort_cfg_list)]);
    }
    // for (i = 1; i < 9; i++) {
    //     var ipl = i - 1
    //     if (sorting_type == i) output.sort((a, b) => (a[ipl] > b[ipl]) ? 1 : ((b[ipl] > a[ipl]) ? -1 : 0))
    //     if (sorting_type == -i) output.sort((a, b) => (a[ipl] > b[ipl]) ? -1 : ((b[ipl] > a[ipl]) ? 1 : 0))
    // }
}

function normal_array(array_) {
    return array_.map(word => word.trim().replace(/\s+/g, "_").replace(/\W/g, "").replace(/_+/, "_").toLowerCase())
}

function normal_spacinig(text_) {
    return text_.replace(/[ \t]+/g, " ").replace(/\n+\s*/g, "\n").trim()
}

function text_rm_dup_lines(text_) {
    text_ = normal_spacinig(text_)
    text_.split("\n")
    text_ = [...new Set(text_)]
    text_ = text_.join("\n")
    text_ = normal_spacinig(text_)
    return text_;
}

function array_to_header_table(objects_in, header_in) {
    var table = []
    var header = normal_array(header_in)

    objects_in.forEach(function (object_) {
        var table_row = []

        header.forEach(function (header_val) {
            var cell_value = ""
            if (header_val in object_)
                cell_value = String(object_[header_val])
            if (header_val == "json_")
                cell_value = JSON.stringify(object_)
            table_row.push(cell_value)
        })

        table.push(table_row)
    })
    return table
}

function idobject_to_header_table(objects_in, header_in) {
    var table = []
    var header = normal_array(header_in)

    for (const [key_, object_] of Object.entries(objects_in)) {
        var table_row = []

        header.forEach(function (header_val) {
            var cell_value = ""

            if (header_val in object_)
                cell_value = String(object_[header_val])
            if (header_val == "json_")
                cell_value = JSON.stringify([key_, object_])
            if (header_val == "key_")
                cell_value = String(key_)

            table_row.push(cell_value)
        })

        table.push(table_row)
    }
    return table
}

function make_herb_item(hid_obj) {
    var herb_item = {}
    // hid_obj
    return herb_item
}

function decompres_herbs_obj(some_obj, hdata, inventory) {
    var obj_as_list = [some_obj]
    if (Array.isArray(some_obj))
        obj_as_list = JSON.parse(JSON.stringify(some_obj))

    var fin_items = []
    // hid_obj

    for (const base_obj of obj_as_list) {
        var raw_key = base_obj.herbs_id; delete base_obj.herbs_id;
        var key_list = raw_key.split(/\s|\n/g).map(word => word.trim()).filter(word => word.length > 0)
        for (const new_value of key_list) {
            var new_obj = JSON.parse(JSON.stringify(base_obj))
            new_obj.short_id = new_value.toUpperCase().trim()

            if (!(new_obj.short_id in hdata.stoh)) {
                make_warning_item(inventory, "* No pot short ID " + new_obj.short_id, JSON.stringify(base_obj), base_obj)
                continue;
            }
            fin_items.push(new_obj)
        }
    }

    return fin_items
}

function structure_table(table_in, tab_row_extra) {
    var objects = []
    var table = JSON.parse(JSON.stringify(table_in))
    var head = normal_array(table.shift());

    table.forEach(function (row_val, row_no) {
        var new_obj = {}
        var is_valid = false
        row_val.forEach(function (col_val, col_no) {
            if (col_val) is_valid = true
            new_obj[head[col_no]] = col_val
            new_obj.tab_row_index = row_no + tab_row_extra
        })
        if (is_valid) objects.push(new_obj)
    })

    return objects;
}


function make_unique_words(some_str) {
    var some_arr = some_str.split(/\s|\n/g).map(word => word.trim()).filter(word => word.length > 0)
    some_arr = [...new Set(some_arr)]
    // some_arr.sort()
    return some_arr.join(" ")
}

function extract_raw_data(obj_list, key_name = "name") {
    for (const item of obj_list) {
        if (!(key_name in item)) continue
        if (item[key_name].includes("RAW")) {
            item[key_name] = item[key_name].replace("RAW", "")
            item.is_raw_ = true
        } else item.is_raw_ = false
    }
}

function extract_remove_data(obj_list, key_name = "name") {
    for (const item of obj_list) {
        if (!(key_name in item)) continue
        if (item[key_name].includes("REMOVE")) {
            item[key_name] = item[key_name].replace("REMOVE", "")
            item.is_remove_ = true
        } else item.is_remove_ = false
    }
}

function extract_misc_data(obj_list, key_name = "misc") {
    for (const item of obj_list) {
        if (!(key_name in item)) continue
        var the_loc = item[key_name].match(/(~\w+)/); the_loc = (the_loc) ? the_loc[1].trim() : ""
        item.location_ = the_loc
        item[key_name] = make_unique_words(item[key_name])
    }
}

function compile_herbs_data(herb_data_in, herb_efect_in) {
    var hdata = []
    hdata.stoh = {}
    hdata.hdat = {}

    var herb_data_list = structure_table(herb_data_in, 2)
    var herb_efect_list = structure_table(herb_efect_in, 2)


    for (const herb_ of herb_efect_list) {
        var name_ = herb_.name.trim()
        if (!name_) continue
        hdata.hdat[name_] = {}
        hdata.hdat[name_].misc = ""
        hdata.hdat[name_].sesion = ""
        hdata.hdat[name_].name = herb_.name.trim()
        hdata.hdat[name_].type = herb_.type.split(/,/).filter(word => word.length > 2).map(word => word.trim())
        hdata.hdat[name_].rare = herb_.rarity
        hdata.hdat[name_].details = herb_.details
        hdata.hdat[name_].description = herb_.details
        hdata.hdat[name_].dc = herb_.dc
        hdata.hdat[name_].grow_ids = []
        hdata.hdat[name_].grows = herb_.grows.split(/,/).filter(word => word.length > 2).map(word => word.trim())
        hdata.hdat[name_].count = 0
        //    output.push( [ name_ , JSON.stringify(hdata.hdat[name_]) ] );
    }


    //  output.push( [ "hdata.hdat" , JSON.stringify(hdata.hdat) ] );
    for (const herb_ of herb_data_list) {
        var dice = herb_.roll_2d6
        var name = herb_.name.trim()
        var id_ = herb_.short_id.toUpperCase().trim()
        if (!id_) continue
        hdata.stoh[id_] = {}
        hdata.stoh[id_].grows = herb_.grows
        hdata.stoh[id_].grows_id = herb_.grows_id
        hdata.stoh[id_].dice = dice
        hdata.stoh[id_].id = id_
        hdata.stoh[id_].name = name
        hdata.stoh[id_].rules = herb_.rules
        hdata.stoh[id_].ew = (typeof dice == 'number' && (dice <= 4 || dice >= 10)) ? true : false
        //    output.push( [ id_ , JSON.stringify( hdata.stoh[id_]  ) , JSON.stringify( hdata.hdat[name])  ,hdata.hdat ,name  ] );
        if (name in hdata.hdat) {
            hdata.hdat[name].grow_ids.push(id_)
            hdata.hdat[name].details += "\n" + hdata.stoh[id_].rules
            if (hdata.stoh[id_].ew) hdata.hdat[name].ew = true

            hdata.hdat[name].details = normal_spacinig(hdata.hdat[name].details)
        }
    }

    for (var [key, val] of Object.entries(hdata.hdat)) {
        if (val.grow_ids)
            val.details += "\n * DC " + val.dc + ", IDs " + val.grow_ids.join(" ")
    }



    return hdata
}

function ensure_herb_item(hid_obj, inventory, hdata, ignore_common) {
    var herb_data_id = ""
    var herb_inv_id = ""

    hid_obj.short_id = hid_obj.short_id.toUpperCase();
    if (hid_obj.short_id in hdata.stoh) {
        herb_data_id = hdata.stoh[hid_obj.short_id].name

        if (herb_data_id == "Common Ingredient") {
            if (ignore_common == false)
                make_warning_item(inventory, "* Reroll a common ingr " + hid_obj.short_id, JSON.stringify(hid_obj), hid_obj)
            return null
        }

        herb_inv_id = herb_data_id
        if ("location_" in hid_obj)
            herb_inv_id += hid_obj.location_
        hid_obj.inv_id_ = herb_inv_id
    } else {
        make_warning_item(inventory, "* No get short ID " + hid_obj.short_id, JSON.stringify(hid_obj), hid_obj)
        return null
    }


    if (herb_inv_id in inventory)
        return inventory[herb_inv_id]

    var proto_obj = { ...hid_obj, ...hdata.hdat[herb_data_id] }
    var herb_inv_obj = make_base_item(herb_inv_id, proto_obj)

    herb_inv_obj.weight = 0.05
    herb_inv_obj.inv_id_ = herb_inv_id
    herb_inv_obj.name = herb_data_id
    herb_inv_obj.misc = ""
    if ("misc" in hid_obj) herb_inv_obj.misc += " " + hid_obj.misc + " "
    herb_inv_obj.misc = make_unique_words(herb_inv_obj.misc)


    inventory[herb_inv_id] = herb_inv_obj
    return inventory[herb_inv_id]
}

function make_base_item(name, base_obj = {}) {
    var item_obj = JSON.parse(JSON.stringify(base_obj))

    if (!("misc" in item_obj)) item_obj.misc = ""
    if (!("count" in item_obj)) item_obj.count = 0
    if (!("cost" in item_obj)) item_obj.cost = 0
    if (!("weight" in item_obj)) item_obj.weight = 0
    if (!("name" in item_obj)) item_obj.name = name

    return item_obj
}

function ensure_item_inv(name, inventory, base_obj = {}) {
    if (name in inventory)
        return inventory[name]

    var item_obj = make_base_item(name, base_obj)
    item_obj.inv_id_ = name
    item_obj.name = name

    inventory[name] = item_obj
    return inventory[name]
}


function ensure_potion_item(hid_obj, inventory, hdata) {
    hid_obj.herbs_id = hid_obj.herbs_id.toUpperCase()
    var list_herbs_sid = hid_obj.herbs_id.split(/\s|\n/).map(word => word.trim()).filter(word => word.length > 0).sort()

    var pot_herbs_list = []
    for (const herb_sid of list_herbs_sid) {
        var proto_obj = { short_id: herb_sid, location_: hid_obj.location_, misc: hid_obj.misc }
        var herb_item = ensure_herb_item(proto_obj, inventory, hdata, false)
        // var herb_item = ensure_herb_item({ ...hid_obj, ...{ short_id: herb_sid } }, inventory, hdata,false)
        if (!herb_item) {
            make_warning_item(inventory, "* No potion herb " + herb_sid, JSON.stringify(hid_obj), hid_obj)
            return null
        }
        // delete herb_item.herbs_id
        // delete herb_item.available
        // delete herb_item.is_raw_
        pot_herbs_list.push(herb_item)
    }


    // var pot_obj = JSON.parse(JSON.stringify(hid_obj)) ;    delete pot_obj.herbs_id

    var pot_obj = make_base_item(potion_id, hid_obj)
    pot_obj.name_list = pot_herbs_list.map(obj_ => obj_.name)
    pot_obj.ingredients = pot_herbs_list
    pot_obj.name = ""
    pot_obj.type = "UNKNOWN"
    pot_obj.dc = 10; pot_herbs_list.forEach(obj_ => pot_obj.dc += obj_.dc);
    pot_obj.description = pot_herbs_list.map(obj_ => obj_.description).join("\n")
    pot_obj.details = pot_herbs_list.map(obj_ => obj_.details).join("\n")
    pot_obj.sesion = ""
    pot_obj.weight = 0.3
    pot_obj.misc = ""
    if ("misc" in hid_obj) pot_obj.misc = make_unique_words(hid_obj.misc)

    pot_obj.description = "Make DC " + pot_obj.dc + " \n " + pot_obj.description
    pot_obj.description = normal_spacinig(pot_obj.description)

    pot_obj.details = pot_obj.details.replace(/[ \t]+/g, " ").replace(/\n+\s*/g, "\n").trim()
    if (pot_obj.details.includes("Toxin Effect:")) {
        pot_obj.type = "Potion TOXIN"
    } else if (pot_obj.details.includes("Potion Effect:")) {
        pot_obj.type = "Potion HEAL"
    } else if (pot_obj.details.includes("Enchantment")) {
        pot_obj.type = "Potion ENCH"
    } else if (pot_obj.details.includes("Special")) {
        pot_obj.type = "Potion MISC"
    }
    pot_obj.name = pot_obj.type + " from " + pot_obj.name_list.join(", ")

    var potion_id = pot_obj.name + pot_obj.location_
    pot_obj.details += "\n * potion_id : " + potion_id
    pot_obj.inv_id_ = potion_id


    if(potion_id in inventory)
        return inventory[potion_id]

    inventory[potion_id] = pot_obj
    return inventory[potion_id]
}




function gather_herbs(items_herbs_get, inventory, normal_gather) {
    for (const hid_obj of items_herbs_get) {
        if (normal_gather === hid_obj.is_raw_) continue
        var modif_ = 1
        if (hid_obj.is_remove_) modif_ = -1
        try {
            inventory[hid_obj.inv_id_].count += modif_
        } catch (error) {
            make_warning_item(inventory, "* ..... " + hid_obj.inv_id_, JSON.stringify(hid_obj) + error, hid_obj)
        }
    }
}


function make_warning_item(inventory, name, message, base_obj = {}) {
    if (name in inventory)
        return inventory[name]

    var warn_item = make_base_item(name, base_obj)

    warn_item.name = name
    warn_item.count = -100

    if ("tab_row_index" in warn_item)
        warn_item.name += " At line " + warn_item.tab_row_index

    warn_item.misc += " WARNING "
    warn_item.misc = make_unique_words(warn_item.misc)

    warn_item.details = message + " \n " + warn_item.details
    warn_item.description = message + " \n " + warn_item.description

    inventory[name] = warn_item
    return inventory[name]
}



function potions_from_herbs(items_herbs_pot, inventory, hdata) {
    for (const hid_obj of items_herbs_pot) {
        var pot_obj = ensure_potion_item(hid_obj, inventory, hdata)
        if (!pot_obj) continue

        if (hid_obj.available === 1)
            pot_obj.count += 1

        if (hid_obj.available === "" )
            pot_obj.count += -1000

        if (hid_obj.is_raw_)
            continue // after this line, is considered as consumable

        for (var herb_obj of pot_obj.ingredients)
            herb_obj.count -= 1


        var item_proto = { location_: pot_obj.location_ }
        item_proto.misc = pot_obj.misc
        if (pot_obj.name_list.includes("Elemental Water")) {
            var consume = ensure_item_inv("Enchanted Vial", inventory)
            consume.count -= 1
        }
        else {
            var consume = ensure_item_inv("Vial", inventory)
            consume.count -= 1
        }

    }
}

function auto_herbs_changes(inventory, hdata) {
    for (var [key, val] of Object.entries(inventory)) {
        // if (!("grow_ids" in val)) continue


        if (val.details.includes("Find 2x") && !val.details.includes("Find 2x the rolled amount in")) {
            val.details += "\n *Originally " + val.count + " x2"
            val.count = Math.floor(val.count * 2)
        }
        if (val.details.includes("Find 1-2x") && !val.details.includes("Find 1-2x the rolled amount in")) {
            val.details += "\n *Originally " + val.count + " x1.5"
            val.count = Math.floor(val.count * 1.5)
        }
        if (val.details.includes("Come with 1 Elemental Water")) {
            var elem_water = ensure_herb_item({ ...val, ...{ short_id: "EW" } }, inventory, hdata, false)
            elem_water.count += 1
        }
        if (val.ew) {
            var got_ew = Math.floor(val.count * 0.25)
            val.details += "\n *Originally " + val.count + ", " + got_ew + " turned to Elemental Water"
            val.count -= got_ew

            var elem_water = ensure_herb_item({ ...val, ...{ short_id: "EW" } }, inventory, hdata, false)
            elem_water.count += got_ew
        }

        val.details = normal_spacinig(val.details)
    }

}

/*


Manage HERBS

Data taken from HERB_DATA
Write the Herb ID as Loc#
    - Loc   single character denoting places like Forest, Desert, Common
    - #     2D6 roll value of the item

RAW in name, skip automatic actions like get extra herbs or convert to Elemental Water
REMOVE in name will remove the Herbs instead of adding them

-------------------

Manage POTIONS

Write the Herb IDs used to make a potion
It will remove (Enchanted) Vials by default
"Make DC ## " The DC to make the potion

RAW in name, skip automatic actions like removing a vile

AVAILABLE can be
    Empty -1000 to the item to ensure it will be at the top
    0 failed to make it or used it
    1 available in the inventory


*/
function MANAGE_HERBS_POTIONS(out_header, config, input_herbs, input_potions, herb_data_in, herb_efect_in) {
    var output = []
    var inventory = {}

    var hdata = compile_herbs_data(herb_data_in, herb_efect_in)

    var herbs_sid_get = structure_table(input_herbs, 4)
    extract_raw_data(herbs_sid_get, "herbs_id"); extract_misc_data(herbs_sid_get, "misc")
    extract_remove_data(herbs_sid_get, "herbs_id")
    var items_herbs_get = decompres_herbs_obj(herbs_sid_get, hdata, inventory)

    var herbs_sid_pot = structure_table(input_potions, 4)
    extract_raw_data(herbs_sid_pot, "herbs_id"); extract_misc_data(herbs_sid_pot, "misc")


    // output.push(normal_array(input_herbs[0]))
    // output.push(normal_array(out_header[0]))
    // output.push(["items_herbs_get", JSON.stringify(items_herbs_get)])
    // output = output.concat(array_to_header_table(items_herbs_get, out_header[0]))
    // output = output.concat(array_to_header_table(items_herbs_get, out_header[0]))

    // hdata.forEach(hid_obj => ensure_herb_item(hid_obj, inventory, hdata,false));
    // var herb_item = ensure_herb_item({ ...hid_obj, ...{ short_id: herb_sid } }, inventory, hdata,false)

    items_herbs_get.forEach(hid_obj => ensure_herb_item(hid_obj, inventory, hdata, false));

    gather_herbs(items_herbs_get, inventory, true)
    auto_herbs_changes(inventory, hdata)
    gather_herbs(items_herbs_get, inventory, false)
    potions_from_herbs(herbs_sid_pot, inventory, hdata)

    for (const [key, value] of Object.entries(hdata.stoh)) { ensure_herb_item({ short_id: key }, inventory, hdata, true) }


    // herbs_sid_get.forEach((hid_obj, index) => {
    //     hid_obj.name = hid_obj.herbs_id
    //     output.push([index, JSON.stringify(hid_obj)])
    // });

    // output = output.concat(array_to_header_table(herbs_sid_get, out_header[0]))
    // output = output.concat(array_to_header_table(items_herbs_get, out_header[0]))
    // output = output.concat(idobject_to_header_table(hdata, out_header[0]))

    // output.push(normal_array(out_header[0]))
    // output = output.concat(idobject_to_header_table(hdata.hdat, out_header[0]))
    // output = output.concat(idobject_to_header_table(items_herbs_get, out_header[0]))
    // output = output.concat(idobject_to_header_table(herbs_sid_pot, out_header[0]))

    // output = output.concat(idobject_to_header_table(inventory, out_header[0]))

    // for (i = 1; i < 9; i++) {
    //     var ipl = i - 1
    //     if (sorting_type == i) output.sort((a, b) => (a[ipl] > b[ipl]) ? 1 : ((b[ipl] > a[ipl]) ? -1 : 0))
    //     if (sorting_type == -i) output.sort((a, b) => (a[ipl] > b[ipl]) ? -1 : ((b[ipl] > a[ipl]) ? 1 : 0))
    // }


    inventory_to_output(inventory, config, out_header[0], output)

    return output
}


/*
<- Specify the number D of locations and the specific character C of the place
It will give the D of 2D6 rolls for place C
If a non-common ingredient is rolled (6, 7, 8), the place/herb is converted to common and a new vallue is rolled
C7 (Bloodgrass) is re-rolled once so we have less of it

Example :
3C = 3 common herbs
f f = 2 Forest herbs

*/
function ROLL_POTIONS(in_sid) {
    var out_list = []
    var roll_sid = []

    var list_sid = in_sid.toUpperCase().split(/\s|\n/g).map(word => word.trim()).filter(word => word.length > 0)

    for (const sid_raw of list_sid) {
        var sid_str = sid_raw

        var mul_val = 1

        var mul_check = sid_raw.match(/(\d+)(\w)/)
        if (mul_check) {
            mul_val = parseInt(mul_check[1])
            sid_str = mul_check[2]
        }

        for (let index = 0; index < mul_val; index++) {
            var sid_obj = {}
            sid_obj.gather = sid_str
            sid_obj.roll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)
            roll_sid.push(sid_obj)
        }
    }

    for (const sid_obj of roll_sid) {
        if (sid_obj.gather != "C" && sid_obj.roll >= 6 && sid_obj.roll <= 8) {

            sid_obj.gather = "C"
            sid_obj.roll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)
        }

        if (sid_obj.gather != "C" && sid_obj.roll == 7) { // Re-roll Bloodgrass so we have less of it
            sid_obj.roll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)
        }

        out_list.push(sid_obj.gather + sid_obj.roll)
    }


    return [["<IN..OUT>\n Quick roll\n for herbs", out_list.join(" ")]]
}

function compile_harvest_data(harv_creature, harv_items, harv_craft) {
    var harv_data = {}

    var hrvcrea = structure_table(harv_creature, 2)
    var hrvitem = structure_table(harv_items, 2)
    var hrvcraf = structure_table(harv_craft, 2)

    for (var hrv_obj of hrvcrea) {
        if (!(hrv_obj.name in harv_data)) {
            var monster = {}
            monster.name = hrv_obj.name
            monster.id = hrv_obj.id
            monster.harvest = []
            monster.items = []
            harv_data[hrv_obj.name] = monster
            harv_data[hrv_obj.name.toLowerCase()] = monster
        }

        hrv_obj.details = hrv_obj.description
        hrv_obj.value_ = hrv_obj.value
        hrv_obj.weight_ = hrv_obj.weight
        hrv_obj.cost = hrv_obj.valuenumber
        hrv_obj.weight = hrv_obj.weightnumber

        hrv_obj.crafting = hrv_obj.crafting.replace(/\[Type\]/g, "[" + hrv_obj.name + "]")
        hrv_obj.item = hrv_obj.item.replace(/\[Type\]/g, "[" + hrv_obj.name + "]")
        hrv_obj.details = hrv_obj.details.replace(/\[Type\]/g, "[" + hrv_obj.name + "]")

        if (hrv_obj.crafting)
            hrv_obj.details += "\n * Used for: " + hrv_obj.crafting
        hrv_obj.details = normal_spacinig(hrv_obj.details)

        harv_data[hrv_obj.name].harvest.push(hrv_obj)
    }

    for (const hrv_obj of hrvitem) {
        if (!(hrv_obj.name in harv_data)) {
            var monster = {}
            monster.name = hrv_obj.name
            monster.id = hrv_obj.id
            monster.harvest = []
            monster.items = []
            harv_data[hrv_obj.name] = monster
            harv_data[hrv_obj.name.toLowerCase()] = monster
        }

        hrv_obj.value_ = hrv_obj.value
        hrv_obj.weight_ = hrv_obj.weight
        hrv_obj.cost = hrv_obj.valuenumber
        hrv_obj.weight = hrv_obj.weightnumber

        harv_data[hrv_obj.name].items.push(hrv_obj)
    }

    for (const hrv_obj of hrvcraf) {
        if (!(hrv_obj.name in harv_data)) {
            harv_data[hrv_obj.name] = hrv_obj
            harv_data[hrv_obj.name.toLowerCase()] = hrv_obj
        }
    }


    return harv_data
}


function extract_harv_data(obj_list, key_name = "name") {
    for (var item of obj_list) {
        item.name = item[key_name]

        var check_dc = item.name.match(/.*((?:dc|DC|Dc|dC)(\d+))/)
        if (check_dc) {
            item.name = item.name.replace(check_dc[1], "")
            item.name = normal_spacinig(item.name)
            item.dc_roll = parseInt(check_dc[2])
        }

        var check_item = item.name.match(/.*((?:id8r|item)(\d+))/)
        if (check_item) {
            item.name = item.name.replace(check_item[1], "")
            item.name = normal_spacinig(item.name)
            item.item_roll = parseInt(check_item[2]) - 1
        }

        if (item.name.includes("SREQ")) {
            item.name = item.name.replace("SREQ", "")
            item.skip_req_ = true
        } else item.skip_req_ = false

        item.name = normal_spacinig(item.name)
    }
}

function ensure_harvest_inv(harv_row, inventory, base_obj = {}) {
    // ID	Name	DC	Item	Value	Weight	Crafting	Requires	ValueNumber	WeightNumber	Multiplier	Misc	Description
    // ID	Name	roll d8	Item	Value	Weight	ValueNumber	WeightNumber
    var harv_inv_id = harv_row.item + base_obj.location_

    if (harv_inv_id in inventory)
        return inventory[harv_inv_id]

    var proto_obj = { ...base_obj, ...harv_row }
    var harv_inv_obj = make_base_item(harv_inv_id, proto_obj)

    harv_inv_obj.inv_id_ = harv_inv_id
    harv_inv_obj.name = harv_row.item
    harv_inv_obj.misc = ""
    if ("misc" in base_obj) harv_inv_obj.misc += " " + base_obj.misc + " "
    harv_inv_obj.misc = make_unique_words(harv_inv_obj.misc)

    inventory[harv_inv_id] = harv_inv_obj
    return inventory[harv_inv_id]
}

function alocate_harv_harvest(harv_in_base, inventory, harv_data) {
    for (const harv_obj of harv_in_base) {

        if (!(harv_obj.name in harv_data)) {
            make_warning_item(inventory, "* No such monster " + harv_obj.name, JSON.stringify(harv_obj), harv_obj)
            continue;
        }

        if (!("dc_roll" in harv_obj)) {
            make_warning_item(inventory, "* No harvest DC (dcN) " + harv_obj.name, JSON.stringify(harv_obj), harv_obj)
            continue;
        }

        var monster = harv_data[harv_obj.name]
        for (const harv_row of monster.harvest) {
            if (harv_row.dc > harv_obj.dc_roll) continue;

            var harv_inv_obj = ensure_harvest_inv(harv_row, inventory, harv_obj)

            if (harv_inv_obj.skip_req_ && harv_inv_obj.requires) continue;

            harv_inv_obj.count += harv_inv_obj.multiplier

            if (harv_inv_obj.crafting) {
                var craftable_ = null
                if (harv_inv_obj.crafting in harv_data) {
                    var base_cr = { ...harv_data[harv_inv_obj.crafting], ...harv_obj }
                    craftable_ = ensure_item_inv(harv_inv_obj.crafting, inventory, base_cr)
                } else {
                    craftable_ = ensure_item_inv(harv_inv_obj.crafting, inventory, harv_obj)
                }

                if (!craftable_.details) craftable_.details = ""

                // if (craftable_.details.includes("Made with " + harv_inv_obj.name) === false)
                //     craftable_.details += "\n * Made with " + harv_inv_obj.name

                if (craftable_.details.includes("Made with ")) {
                    if (craftable_.details.includes("Made with " + harv_inv_obj.name) === false)
                        craftable_.details = craftable_.details.replace("Made with", "Made with " + harv_inv_obj.name + ", ")
                } else
                    craftable_.details += "\n * Made with " + harv_inv_obj.name

                if (harv_obj.tab_row_index) {
                    if (craftable_.details.includes("harvested at line"))
                        craftable_.details = craftable_.details.replace("harvested at line", "harvested at line " + harv_obj.tab_row_index + ", ")
                    else
                        craftable_.details += " harvested at line " + harv_obj.tab_row_index
                }

                craftable_.details = normal_spacinig(craftable_.details)
            }

            if (harv_inv_obj.is_raw_) continue;

            if (harv_inv_obj.requires) {
                var req_id = harv_inv_obj.requires + harv_obj.location_
                var consume = ensure_item_inv(req_id, inventory, harv_obj)
                consume.name = harv_inv_obj.requires
                consume.count -= harv_inv_obj.multiplier
            }
        }

        if (monster.items.length > 0) {
            if (!("item_roll" in harv_obj)) {
                make_warning_item(inventory, "* No 1d8 trinket (id8rN/itemN) " + harv_obj.name, JSON.stringify(harv_obj), harv_obj)
                continue;
            }

            var tr_obj = monster.items[harv_obj.item_roll]

            var harv_trink_inv_obj = ensure_harvest_inv(tr_obj, inventory, harv_obj)
            harv_trink_inv_obj.count += 1
        }



    }
}

/*
Harvest creature

Specify in "Harvest Data" the details of 1 harvested creature

RAW skipes rules like using vials and
SREQ only skip REQuired items

Creature Name dc## item##
    dc|DC##     - The DC value rolled for the creature
    id8r|item## - If it has trinkets, roll 1D8 and give also this number


*/
function MANAGE_HARVEST(out_header, config, input_harvest, harv_creature, harv_items, harv_craft) {
    var output = []
    var inventory = {}

    var harv_in_base = structure_table(input_harvest, 4)
    extract_raw_data(harv_in_base, "harvest_data");
    extract_harv_data(harv_in_base, "harvest_data");
    extract_misc_data(harv_in_base, "misc");

    var harv_data = compile_harvest_data(harv_creature, harv_items, harv_craft)

    alocate_harv_harvest(harv_in_base, inventory, harv_data)

    // output = output.concat(idobject_to_header_table(harv_data, out_header[0]))
    // output = output.concat(idobject_to_header_table(inventory, out_header[0]))
    // output.push(normal_array(out_header[0]))
    // output = output.concat(array_to_header_table(harv_in_base, out_header[0]))

    inventory_to_output(inventory, config, out_header[0], output)

    return output
}

function get_count(val_) {
    return parseFloat(val_) || 0
}

function get_cost(val_) {
    if (typeof (val_) == 'number') return parseFloat(val_)
    if (val_.includes(",")) val_ = val_.replace(",", "")
    if (val_.includes("gp")) return parseFloat(val_.replace("gp", ""))
    if (val_.includes("sp")) return parseFloat(val_.replace("sp", "")) / 10
    if (val_.includes("cp")) return parseFloat(val_.replace("cp", "")) / 100

    return parseFloat(val_) || 0
}

function get_weight(val_) {
    if (typeof (val_) == 'number') return parseFloat(val_)
    if (val_.includes(",")) val_ = val_.replace(",", "")
    return parseFloat(val_) || 0
}


function add_to_inventory(inventory, inv_obj_list) {
    for (var inv_obj of inv_obj_list) {
        var obj_id = ""
        if ("name" in inv_obj) obj_id += inv_obj.name
        if ("location_" in inv_obj) obj_id += inv_obj.location_

        if (obj_id == "") continue

        if (!(obj_id in inventory)) {
            inventory[obj_id] = {}
            inventory[obj_id].misc = ""
            inventory[obj_id].sesion = ""
            inventory[obj_id].count = 0
            inventory[obj_id].cost = 0
            inventory[obj_id].weight = 0
        }

        for (const [key_, val_] of Object.entries(inv_obj)) {

            if (!key_) continue;
            else if (key_ in inventory[obj_id] === false) inventory[obj_id][key_] = val_
            else if (key_ == 'name') inventory[obj_id][key_] = val_
            else if (key_ == 'count') inventory[obj_id][key_] += get_count(val_)
            else if (key_ == 'cost') inventory[obj_id][key_] = get_cost(val_)
            else if (key_ == 'weight') inventory[obj_id][key_] = get_weight(val_)
            //   else  if (key_ == "count") inventory[obj_id] += val_

            else if (key_ == "misc") {
                inventory[obj_id].misc += " " + val_ + " "
                inventory[obj_id].misc = make_unique_words(inventory[obj_id].misc)
            }
            // else if (key_ == "sesion") {
            else if (typeof val_ == 'number') inventory[obj_id][key_] = val_
            else if (typeof val_ == 'string') {
                inventory[obj_id][key_] += " \n " + val_ + " \n "
                inventory[obj_id][key_] = normal_spacinig(inventory[obj_id][key_])
                // inventory[obj_id][key_] = text_rm_dup_lines(inventory[obj_id][key_])
            }
        }
    }
}

/*

Inventory

"~TEXT" in MISC will treat TEXT as another container that holds items

*/
function MANAGE_INVENTORY() {

    var out_header = arguments[0]
    var config = arguments[1]

    var output = []
    var inventory = {}

    for (let index = 0; index < arguments.length; index++) {
        if (index <= 1) continue
        const inv_in = arguments[index];
        var inv_obj = structure_table(inv_in, 3)
        extract_misc_data(inv_obj, "misc")
        add_to_inventory(inventory, inv_obj)

    }


    // output = output.concat(array_to_header_table(str_inv_1, out_header[0]))
    // output.push(normal_array(out_header[0]))
    // output = output.concat(idobject_to_header_table(inventory, out_header[0]))

    inventory_to_output(inventory, config, out_header[0], output)


    return output
}
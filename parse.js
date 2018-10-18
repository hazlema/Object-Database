Array.prototype.dump = function(opt={}) {
    const ansi   = require('ansi');
    const cursor = ansi(process.stdout);
    var rowColor = 1;

    function log(display, isHeader = false) {
        for (var counter = 0; counter < display.length; counter++) {

            switch (display[counter]) {
                case '+': cursor.brightMagenta();   cursor.write("+"); break;
                case '-': cursor.magenta();   cursor.write("-"); break;
                case '|': cursor.brightMagenta();   cursor.write("!"); break;
                default: {
                    if (isHeader) 
                        cursor.brightYellow();
                    else
                        if (rowColor % 2 == 0) cursor.brightWhite(); else cursor.brightBlue();

                    cursor.write(display[counter]);
                }
            }
        }
        console.log("");
        rowColor++;

        cursor.fg.reset();
    }

    var sizes = {};
    var tableData = this;

    if (tableData.length != 0) {
        // Get col sizes
        for(var item of tableData) {
            for(var key of Object.keys(item)) {
                if (!(key in sizes)) sizes[key] = key.toString().length + 1;
                        
                var itemSize = item[key].toString().length + 1;
                if (sizes[key] < itemSize) sizes[key] = itemSize;
            }
        }

        // Excludes
        if ("exclude" in opt) {
            for(var ex of opt.exclude) {
                delete sizes[ex];
            };
        }
    
        // Build the separator
        var sep = '+';
        for (key of Object.keys(sizes)) {
            sep += "-".repeat(sizes[key]+2);
            sep += "+";
        }
        
        // Build Header
        var header = "";
        for (key of Object.keys(sizes)) {
            var item = key.toString().padEnd(sizes[key]);
            header += `| ${item} `;
        }
        header += `|`;
        
        log(sep);
        log(header, true);
        log(sep);
        
        // Build Items
        for(var item of tableData) {
            var row = "";
            for (key of Object.keys(sizes)) {
                var rowItem = (key in item) ?
                item[key].toString().padEnd(sizes[key]) :
                "".padEnd(sizes[key]);
                
                row += `| ${rowItem} `;
            }
            log(row + '|');
        }
        log(sep);
    }
}

Object.prototype.query = function(Query, showQuery=false) {
    var db      = this;
    var dataSet = db;
    var results = [];
    var query   = buildQuery(Query);
    
    if (showQuery) query.dump();

    for (var thisTest of query) {

        if ("chain" in thisTest) {
            if (thisTest.chain == "&&") {
                // And
                dataSet = results;
                results = [];
            } else {
                // Or
                dataSet = db;
            }
        }
        
        for (var row of dataSet) {
            var test;    
            var value = String(row[thisTest.key]);

            var rx = thisTest.value.join(',')
                .replace(/,or,/g, "|")
                .replace(/,and,/g, "&");

            if (thisTest.op == 'like')
                test = new RegExp(rx, 'i');
            else
                test = new RegExp(rx);

            if (value.match(test) && !results.includes(row)) { 
                results.push(row); 
            }
        }
    }
    
    return results;

    /// -----------------------------------------------------------------

    function buildQuery(query) {
        var queries      = [];
        var queriesBuilt = [];
        var queryBuild   = {};
        
        // Is Sub Query
        function isSub(query) {
            queryTypes = [" == ", " != ", " like ", " > ", " >= ", " < ", " <= "];
            
            return query.includes(queryTypes);
        }
        
        // Is argument a col in the db
        function isCol(query) {
            var cols = [];
            
            for (var item of db) {
                for (var col of Object.keys(item)) {
                    if (!cols.includes(col)) cols.push(col);
                }
            }
            
            return cols.includes(query);
        }
        
        // Parses and or expressions
        function parseAndOr(query) {
            var Sub = [];
            
            if (query.includes('"')) {
                for(var tmp of query.split(/(\s?"(?:[^"\\]|\\.)*")\s?/)) {
                    tmp = tmp.trim();
                    tmp = tmp.replace(/^"/, "");
                    tmp = tmp.replace(/"$/, "");
                    
                    if (tmp != "")
                    Sub.push(tmp);
                } 
            } else Sub.push(query);
            
            return Sub;
        }
        
        // Parses a query "chunk"
        function parseQuery(query) {
            var Query = query.split(' ');
            var query = { key: "[PK]", op: "==", value: "" };
            
            if (isCol(Query[0])) {
                query.key   = Query.shift();
                query.op    = Query.shift();
                query.value = parseAndOr(Query.join(' '));
            } else {
                query.value = parseAndOr(Query.join(' '));
            }
            
            return query;
        }
               
        // Separate sub queries
        for(var tmp of query.split(/(?:\s?(\&\&)\s?|\s?(\|\|)\s?)/g)) {
            if (typeof tmp != 'undefined') queries.push(tmp);
        }
               
        for(var thisQuery of queries) {
            if (thisQuery != "||" && thisQuery != "&&") {
                var query = parseQuery(thisQuery);
                
                queryBuild.key   = query.key;
                queryBuild.op    = query.op;
                queryBuild.value = parseAndOr(query.value);
                
                queriesBuilt.push(queryBuild);
                queryBuild = {};
            } else {
                queryBuild.chain = thisQuery;
            }
        }
        
        return queriesBuilt;
    }   
}

db = [
    {name:"Matthew", color:'red',    num:"90"},
    {name:"Peter",   color:'red',    num:"8"},
    {name:"Alice",   color:'blue'},
    {name:"alex",    color:'blue',   num:"0.1"},
    {name:"Frank",   color:'blue',   num:"70"},
    {name:"Grace",   color:'blue',   num:"0.3"},
    {name:"steve",   color:'yellow', num:"0"},
    {name:"Q",       color:'yellow'},
    {name:"Jeff",    color:'yellow', num:"20"},
    {name:"Lucy",    color:'green',  num:"0.2"},
    {name:"Molly",   color:'green',  num:"50"},
    {name:"Sandy",   color:'green',  num:"10"},
    {name:"Angie",   color:'blue',   num:"300"}
];

//db.query("name == ^[a-z].*", true).dump();

//db.query("name == e$ && color like blue", true).dump({exclude:["num"]});
//console.log(db.query('color == "blue" or "yellow"'));

//db.query('color == "blue" or "yellow"', true).dump();

//db.query('name == "Molly" or "Sandy" or "Lucy" or "Alice" && color == green', true).dump();
 //db.query('name == ^.$', true).dump();
 db.query('name == "Jeff the red" or "Sandy" or "Lucy" or "Alice" || color == red || num == 300', true).dump();


 ///var color = "blue";
 //db.query(`color == ${color}`, true).dump();

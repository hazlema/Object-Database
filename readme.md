## Object Database

Object database consists of three `prototype` functions that extend array.
- [Object Database](#object-database)
    - [The `query` function](#the-query-function)
    - [The `sortCol` function](#the-sortcol-function)
    - [The `dump` function](#the-dump-function)
    - [Sample Database](#sample-database)
    - [Examples](#examples)
  
### The `query` function

Searches an array of objects using queries (like SQL).  
```javascript
db.query('
    [field] 
        [like | == | != | < | <= | > | >= ] 
        [value] [and | or] [value] [&& | ||] 
        [value] [and | or] [value] 
', [(Debugging) true || false] );
```
* See below for more [examples](#examples) including RegEx examples.

**NOTE:** if you import a `JSON` database you will need to `eval` it before the queries will work.** (This will convert the DB back into JS from JSON)

```javascript
vsr fs = require("fs");
db = eval(fs.readFileSync(filename, 'utf8'));`
```

*This function is chainable*

### The `sortCol` function

Sorts by a column (auto detects numbers and does a float sort)

```javascript
db.sortCol( [field], {reverse:false, ignoreCase:true} );
```

*This function is chainable*

### The `dump` function

Dumps an array of objects into a formatted table.

```javascript
db.dump({ exclude:[ field, field, field ] });
```

*This function is _NOT_ chainable*

### Sample Database
For your cutting and pasting needs. :wink:

```javascript
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
```

### Examples

```javascript
// Regular Expressions (Starts with a lower case letter)
db.query("name == ^[a-z].*", true).dump();
```
<pre>
+-------+-----+-----------+
! key   ! op  ! value     !
+-------+-----+-----------+
! name  ! ==  ! ^[a-z].*  !
+-------+-----+-----------+

+--------+---------+------+
! name   ! color   ! num  !
+--------+---------+------+
! alex   ! blue    ! 0.1  !
! steve  ! yellow  ! 0    !
+--------+---------+------+
</pre>

```javascript
// Ends with an e and are blue
db.query("name == e$ && color like blue", true).dump({exclude:"num"});;
```
<pre>
+--------+-------+--------+--------+
! key    ! op    ! value  ! chain  !
+--------+-------+--------+--------+
! name   ! ==    ! e$     !        !
! color  ! like  ! blue   ! &&     !
+--------+-------+--------+--------+

+--------+--------+
! name   ! color  !
+--------+--------+
! Alice  ! blue   !
! Grace  ! blue   !
! Angie  ! blue   !
+--------+--------+
</pre>

```javascript
// or (quotes are very important here)
console.log(db.query('color == "blue" or "yellow"'));

[ { name: 'Alice', color: 'blue' },
  { name: 'alex', color: 'blue', num: '0.1' },
  { name: 'Frank', color: 'blue', num: '70' },
  { name: 'Grace', color: 'blue', num: '0.3' },
  { name: 'steve', color: 'yellow', num: '0' },
  { name: 'Q', color: 'yellow' },
  { name: 'Jeff', color: 'yellow', num: '20' },
  { name: 'Angie', color: 'blue', num: '300' } ]
```

```javascript
// Multiple or's plus a second query
db.query('name == "Molly" or "Lucy" or "Alice" && color == green').dump();
```
<pre>
+--------+--------+------+
! name   ! color  ! num  !
+--------+--------+------+
! Lucy   ! green  ! 0.2  !
! Molly  ! green  ! 50   !
+--------+--------+------+
</pre>

```javascript
// Multi Query -- (Yes, Jeff the Red dosn't exist)
db.query('name == "Jeff the Red" or "Sandy" or "Alice" || ' +
            'color == red || num == 300', true).sortCol("name").dump();
```
<pre>
+--------+-----+---------------------------------+--------+
! key    ! op  ! value                           ! chain  !
+--------+-----+---------------------------------+--------+
! name   ! ==  ! Jeff the Red,or,Sandy,or,Alice  !        !
! color  ! ==  ! red                             ! !!     !
! num    ! ==  ! 300                             ! !!     !
+--------+-----+---------------------------------+--------+

+----------+--------+------+
! name     ! color  ! num  !
+----------+--------+------+
! Alice    ! blue   !      !
! Angie    ! blue   ! 300  !
! Matthew  ! red    ! 90   !
! Peter    ! red    ! 8    !
! Sandy    ! green  ! 10   !
+----------+--------+------+
</pre>

```javascript
// Number sort reversed
db.sortCol("num",{reverse:true}).dump();
```
<pre>
+----------+---------+------+
! name     ! color   ! num  !
+----------+---------+------+
! Angie    ! blue    ! 300  !
! Matthew  ! red     ! 90   !
! Frank    ! blue    ! 70   !
! Molly    ! green   ! 50   !
! Jeff     ! yellow  ! 20   !
! Sandy    ! green   ! 10   !
! Peter    ! red     ! 8    !
! Grace    ! blue    ! 0.3  !
! Lucy     ! green   ! 0.2  !
! alex     ! blue    ! 0.1  !
! steve    ! yellow  ! 0    !
! Alice    ! blue    !      !
! Q        ! yellow  !      !
+----------+---------+------+
</pre>

```javascript
// One letter Names
db.query('name == ^.$', true).dump();
```
<pre>
+-------+-----+--------+
! key   ! op  ! value  !
+-------+-----+--------+
! name  ! ==  ! ^.$    !
+-------+-----+--------+

+-------+---------+
! name  ! color   !
+-------+---------+
! Q     ! yellow  !
+-------+---------+
</pre>

```javascript
// Use Vars
var color  = "blue";
var color2 = "yellow";

db.query(`color == "${color}" or "${color2}"`).sortCol("color").dump({exclude:["num"]});
```
<pre>
+--------+---------+
! name   ! color   !
+--------+---------+
! Angie  ! blue    !
! Grace  ! blue    !
! Frank  ! blue    !
! alex   ! blue    !
! Alice  ! blue    !
! Jeff   ! yellow  !
! Q      ! yellow  !
! steve  ! yellow  !
+--------+---------+
</pre>

```javascript
// Case insensitive
db.query(`name like matthew`).dump();
```
<pre>
+----------+--------+------+
! name     ! color  ! num  !
+----------+--------+------+
! Matthew  ! red    ! 90   !
+----------+--------+------+
</pre>

```javascript
// Greater then or equals 
db.query(`num <= 10`).dump();
```
<pre>
+--------+---------+------+
! name   ! color   ! num  !
+--------+---------+------+
! Peter  ! red     ! 8    !
! Alice  ! blue    !      !
! alex   ! blue    ! 0.1  !
! Grace  ! blue    ! 0.3  !
! steve  ! yellow  ! 0    !
! Q      ! yellow  !      !
! Lucy   ! green   ! 0.2  !
! Sandy  ! green   ! 10   !
+--------+---------+------+
</pre>

```javascript
// Less then or equals 
db.query(`num >= 10`).dump();
```
<pre>
+----------+---------+------+
! name     ! color   ! num  !
+----------+---------+------+
! Matthew  ! red     ! 90   !
! Alice    ! blue    !      !
! Frank    ! blue    ! 70   !
! Q        ! yellow  !      !
! Jeff     ! yellow  ! 20   !
! Molly    ! green   ! 50   !
! Sandy    ! green   ! 10   !
! Angie    ! blue    ! 300  !
+----------+---------+------+
</pre>

```javascript
// Testing null vaules
db.query('num != null', true).dump();
```
<pre>
+------+-----+--------+
! key  ! op  ! value  !
+------+-----+--------+
! num  ! !=  ! null   !
+------+-----+--------+
+----------+---------+------+
! name     ! color   ! num  !
+----------+---------+------+
! Matthew  ! red     ! 90   !
! Peter    ! red     ! 8    !
! alex     ! blue    ! 0.1  !
! Frank    ! blue    ! 70   !
! Grace    ! blue    ! 0.3  !
! steve    ! yellow  ! 0    !
! Jeff     ! yellow  ! 20   !
! Lucy     ! green   ! 0.2  !
! Molly    ! green   ! 50   !
! Sandy    ! green   ! 10   !
! Angie    ! blue    ! 300  !
+----------+---------+------+
</pre>


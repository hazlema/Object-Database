### Object Database

Object database consists of three `prototype` functions that extend array.

### The `query` function

Searches an array of objects using queries (like SQL).  
ex. `db.query('color == "blue" or "yellow"');`

See below for more examples including regex examples.

*This function is chainable*

### The `sortCol` function

Sorts by a column (auto detects numbers and does a float sort)

ex. `db.sortCol("num", {reverse: true});`

The options available are: `ignoreCase` and `reverse`.

*This function is chainable*

### The `dump` function

Dumps an array of objects into a pretty table

ex. 
```javascript
[
    {name:"Matthew", color:'red',    num:"90"},
    {name:"Peter",   color:'red',    num:"8"}
].dump();
```

You can also exclude columns

ex. 
```javascript 
[
    {name:"Peter",   color:'red',    num:"8"}
].dump({exclude:["num"]});
```

### Todo:

- Better Number handling for Queries

### Sample Database

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

### Syntax

- Quotes are required for [or] / [and] arguments (ex. "blue" or "yellow")
- You can use [==] or [like]
- obj.query(query, true) // Will dump out the query breakdown (debug)
- obj.query(query).dump() // Will create a pretty table
- obj.query(query).dump({exclude:["num"]}) // Will exclude the num field from the table dump
- obj.sortCol("name").dump({exclude:["num"]}) // Will sort by name and exclude the num field
- obj.query(query).sortCol("num").dump() // Will preform a query then sort the results by number

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
// Regex + and (Ends with an e and are blue)
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
// or
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
// multi query 'and'
db.query('name == "Molly" or "Sandy" or "Lucy" or "Alice" && color == green').dump();
```
<pre>
+--------+--------+------+
! name   ! color  ! num  !
+--------+--------+------+
! Lucy   ! green  ! 0.2  !
! Molly  ! green  ! 50   !
! Sandy  ! green  ! 10   !
+--------+--------+------+
</pre>

```javascript
// multi query 'or' -- (Yes, Jeff the Red dosn't exist)
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
var color = "blue";
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

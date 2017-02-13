var app = angular.module('vAuto',[]);

app.controller('vAuto', ['$scope', function($scope) {

    // Table prototype constructor--this logic could easily be transferred to receive backend/API/database input instead of taking input from a user
    function Table(collection){
        this.calcIninputLength = function(){
            return collection.length;
        }
        this.inputLength = this.calcIninputLength();
        this.calcNumRows = function(){
            return Math.ceil(this.inputLength/4);
        };
        this.numRows = this.calcNumRows();
        this.calcTotalFields = function(){
            return this.numRows * 4;}
        this.totalFields = this.calcTotalFields();
        this.calcEmptySpcs = function(){
            return this.totalFields - this.inputLength;
        }
        this.emptySpcs = this.calcEmptySpcs();
        // next value to be removed upon invoking of this.remove() method
        this.calcTargetValue = function(){
            return this.numRows * (4-this.emptySpcs);
        }
        this.targetValue = this.calcTargetValue();
        this.assignRow = function (id){
              var ceiling = this.numRows;
              var rowNum = 1;
              for (var i = 0; i<id-1; i++){
                if(rowNum >= ceiling){
                  rowNum = 0;
                }
                rowNum++;
            }
          return rowNum;
        }
        this.assignColumn = function (id){
               return Math.ceil(id/this.numRows)
        }
        this.spacesTBD = this.totalFields - this.targetValue;
        this.startColLoc = (4-this.emptySpcs) + 1;
        this.emptyCreated = 0;
        //creation of word map and placement of word locations in a coordinate system, contained in map object's value
        this.items = new Object();
        for (var i = 0; i<(collection.length+this.emptySpcs); i++) {
                this.items[i+1] = {};
                //first empty field created in last row
                if ((this.emptySpcs!==0) && (this.emptyCreated <= 0) && (i+1 > this.targetValue) && ((i+1)%this.numRows===0)){
                    this.emptyCreated++;
                    this.items[i+1].row = this.numRows;
                    this.items[i+1].column = this.startColLoc;
                    this.items[i+1].wordValue = null;
                    //subsequent empty fields created in last row
                }else if ((this.emptySpcs!==0) && (i+1 > this.targetValue) && (this.emptyCreated > 0) && ((i+1)%this.numRows===0)){
                    this.startColLoc++
                    this.emptyCreated++;
                    this.items[i+1].row = this.numRows;
                    this.items[i+1].column = this.startColLoc;
                    this.items[i+1].wordValue = null;
                    //fields containing word values
                }else{
                this.items[i+1].row = this.assignRow(i+1);
                this.items[i+1].column = this.assignColumn(i+1);
                this.items[i+1].wordValue = collection[i-this.emptyCreated];
            }
        }
        //returns all word values (function solely created for the sake of quick frontend designs)
        this.getValues = function(){
            var newArr = new Array();
            for (var key in this.items) {
                newArr.push(this.items[key]);
            }
            return newArr;
        }
        this.array_values = this.getValues();
        this.findId = function(word){
            for (var key in this.items){
                if(this.items[key].wordValue === word){
                    return parseInt(key)
                }
            }
        }
        this.remove = function(word){
             var hash = this.items;
             var idRemoving = this.findId(word); //the map location to remove
             var nodeRemoved = hash[idRemoving].wordValue;
             if(idRemoving == this.targetValue) {
                 this.items[idRemoving].wordValue = null;
             }else{
             nodeRemoved = null;
             // swap empty field with targetValue
             var temp = hash[this.targetValue].wordValue;
             hash[this.targetValue].wordValue = nodeRemoved;
             hash[idRemoving].wordValue = temp;
             var values = Object.values(hash);
             var allWords = values.map(function(item){
                 return item.wordValue
             });
             var words = allWords.filter(function(item){
                 if(item){
                     return item
                 }
             });
             $scope.sorted = words.sort(function (a, b) {
                 return a.toLowerCase().localeCompare(b.toLowerCase());
             });
             $scope.hash = new Table($scope.sorted);
        }
         }
         //for creation of table for input length <= 4
         this.createSingleRow = function(){


         }
         this.singleRow = this.createSingleRow();
         // instead of using only built-in AngularJS filters on the HTML side, I created word groups on the prototype itself to feed to the frontend
         // for the purpose of exporting entirely reusable arrangements, because this type of logic might be used on the backend--
         // this means tables with 4 columns can now be populated on any frontend framework/design of choice
         // OR tables with any number of columns can now also be recreated here simply by changing the % number.

         Array.prototype.groupBy = function(keyToMatch) {
           return this.reduce(function(group, node) {
             var value = node[keyToMatch];
             group[value] = group[value] || [];
             group[value].push(node);
             return group;
         }, []);
         }
         this.createColumns = function(){
             var hash = this.items;
             var values = Object.values(hash);
             var byColumn = new Array();
             if (this.inputLength<=4){
                 byColumn = values.groupBy('row')
                //  console.log(byColumn,'less than 4');
             }
             else{
                 byColumn = values.groupBy('column');
                 return byColumn;
             }
         }
         this.columns = this.createColumns();
         //again, reusable code to produce rows of words to be put in 4 columns, so rows can be populated on any frontend framework or design
         this.createRows = function(){
             var hash = this.items;
             var values = Object.values(hash);
             var byRow = values.groupBy('row');
             return byRow;
        }
        this.rows = this.createRows();
        // console.log(this.rows ,' this.rowsss');
    }

    // Angular function to intake and process user input, creating table with the Table prototype.
    // input is sorted here, but could done in Table prototype if this were to be used on backend
    $scope.inputButtonClicked = function(input){
        if($scope.input){
            $scope.input = '';
            var sorted = input.split(' ').sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            $scope.sorted = sorted;
            $scope.hash = new Table($scope.sorted);
        }else{
            $scope.errorMessage = 'Please enter some words.'
            console.log($scope.errorMessage);
        }
    }

    // Angular function to initiate the table's remove function
    $scope.removeClicked = function(word){
        $scope.hash.remove(word);
    }

}]);

var myApp = angular.module('myApp', []);
myApp.controller('MyCtrl', ['$scope', '$http', function ($scope, $http) {
    callonload();
    $scope.listD = ["ID", "PATIENT", "MOBILE", "DATE", "TIME", "DOCTOR", "CONFIRMED", "TIMESTAMP"];
    function myFunction() {
        $http.get('/patientdata').success(function (response) {
            $scope.contactlist = response;
        });
    }
    myFunction();
    setInterval(myFunction, 7000);
}]);
$(document).ready(function () {
  var trigger = $('.hamburger'),
      overlay = $('.overlay'),
     isClosed = false;

    trigger.click(function () {
      hamburger_cross();      
    });

    function hamburger_cross() {

      if (isClosed == true) {          
        overlay.hide();
        trigger.removeClass('is-open');
        trigger.addClass('is-closed');
        isClosed = false;
      } else {   
        overlay.show();
        trigger.removeClass('is-closed');
        trigger.addClass('is-open');
        isClosed = true;
      }
  }
  
  $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
  });  
});
callonload = function () {

    // getElementById
    function $id(id) {
        return document.getElementById(id);
    }

    // output information
    function Output(msg) {
        var m = $id("messages");
        m.innerHTML = msg;
    }

    // file drag hover
    function FileDragHover(e) {
        e.stopPropagation();
        e.preventDefault();
        e.target.className = (e.type == "dragover" ? "hover" : "");
    }


    // file selection
    function FileSelectHandler(e) {

        // cancel event and hover styling
        FileDragHover(e);

        var files = e.target.files || e.dataTransfer.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            //  var name = f.name;
            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                var sheet_name_list = workbook.SheetNames;
                var dataw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                var jsons = dataw.map(JSON.stringify);
                //console.log(jsons);
                var datachanged = {json: jsons};
                dataww = datachanged;
                $.ajax({
                    type: 'POST',
                    url: '/data',
                    data: datachanged,
                    // dataType: 'json',
                    success: function (data) {

                        //
                    }
                });

                var myTable = document.getElementById("customers");
                myTable.style.display = "";

                $(document).ready(function () {
                    ko.applyBindings({
                        IDS: dataw
                    });
                });
            };
            reader.readAsBinaryString(f);
        }
        // process all File objects

        for (var i = 0, f; f = files[i]; i++) {
            ParseFile(f);
        }

    }

    // output file information
    function ParseFile(file) {
        document.getElementById("btn").style.display = 'block';
        Output(
            "<p>File Name: <strong>" + file.name +
            "</strong> size: <strong>" + file.size +
            "</strong> bytes</p>"
        );
    }

    // initialize
    function Init() {

        var fileselect = $id("fileselect"),
            filedrag = $id("filedrag"),
            submitbutton = $id("submitbutton");

        // file select
        fileselect.addEventListener("change", FileSelectHandler, false);

        // is XHR2 available?
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {

            // file drop
            filedrag.addEventListener("dragover", FileDragHover, false);
            filedrag.addEventListener("dragleave", FileDragHover, false);
            filedrag.addEventListener("drop", FileSelectHandler, false);
            filedrag.style.display = "block";
        }

    }

    // call initialization file
    if (window.File && window.FileList && window.FileReader) {
        Init();
    }


};

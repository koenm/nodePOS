$(document).ready(function() {

  $.post('/', function(result) {
    $("#top").html(result[0]);
    $("#bottom").html(result[1]);
  });
});

function getCounter(id) {
  $.post('/getCounter', {id:$(id).prop('id')}, function(counter){
    console.log(counter);
  });
}

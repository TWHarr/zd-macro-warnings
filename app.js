/*global confirm */

(function () {

  var tagsOld = [];

  var prefix = '';

  var duplicateField = '';

  Array.prototype.diff = function(a) {
      return this.filter(function(i) {return a.indexOf(i) < 0;});
  };


  return {
    events: {
      'app.created':'checkInitialTags',
      'ticket.tags.changed':'checkChangedTags'
    },

    requests: {
      checkOld: function(tocheck,year,month,day,id) {
        return {
          url: '/api/v2/search.json?query=tags:' + tocheck + '+created>' +
            year + '-' + month + '-' + day + '+type:ticket+requester:' + id,
          type: 'GET',
          dataType: 'json'
        };
      }

    },


    // Gather all tags on a ticket
    pullTags: function(arrayToFill){
      var tags = this.ticket().tags();
      for (var j = 0; j < tags.length; j++) {
          arrayToFill.push(tags[j]);
        }
      return arrayToFill;
    },

    // Grab initial tags.
    checkInitialTags: function(){
      prefix = this.setting('macroPrefix');
      var duplicate = this.requirement('duplicateField');
      duplicateField = this.ticketFields('custom_field_'+duplicate.requirement_id);
      tagsOld.length = 0;
      this.pullTags(tagsOld);
      },

    // Diff current tags against initial, check against ticket history, warn
    checkChangedTags: function(){
      var tagsCurrent = [];
      this.pullTags(tagsCurrent);
      var difference = tagsCurrent.diff(tagsOld);
      var repeatMacros = [];
      if (difference.length > 0) {
        for (var i = 0; i < difference.length; i++){
          if (difference[i].substr(0, prefix.length) == prefix){
            repeatMacros.push(difference[i]);
          }
        }
      }
      // Gather all the information needed to pass to the Zendesk search API.
      var ticket = this.ticket();
      var id = ticket.requester().id();
      var curTicket = ticket.id();
      var d = new Date();
      var year = d.getFullYear()-1;
      var month = d.getMonth()+1;
      var day = d.getDate();
      if (repeatMacros.length > 0) {
        var request = this.ajax('checkOld', repeatMacros, year, month, day, id);
        // once request is done, check if warning is necessary
        request.done( function(data) {
          var repeatIDs = [];
          for (var i = 0; i < data.results.length; i++){
            if (data.results[i].id !== curTicket) {
              repeatIDs.push(data.results[i].id);
            }
          }
          // if prior macros are found:
          if (repeatIDs.length > 0) {
            // popup warning
            var r = confirm("Warning!\n\nThe player has already seen this macro "+
              data.count + " time(s) within the last year.\n\nChoose OK if you"+
              " plan to send it as is.\nChoose Cancel if you plan to adjust it"+
              " or choose a new macro.\nThe duplicated tag(s) are: \n" +
              repeatMacros + " on ticket(s) " + repeatIDs + " .");
            // if the agent still wants to send the macro, mark "duplicate"
            if (r === true) {
              ticket.customField(duplicateField,"yes");
            // if the agent edits the macro/deletes it, remove the tag/field
            } else if (r === false) {
              ticket.tags().remove(repeatMacros);
              ticket.customField(duplicateField,"no");
            }
          //if no prior tags are found, no warning
          } else{
            ticket.customField(duplicateField,"no");
          }
        }
      );
      }
    },

  };

}());

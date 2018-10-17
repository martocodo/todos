/* Controller definition for all front end interactions, data retrieval and knockout task list */
TasksController = function() {
  // Set vars and data stores
  this.model = {}
  this.model.categories = ko.observableArray([]);
  this.model.users = ko.observableArray([]);
  this.model.tasks = [];
  this.taskListView = {};
  this.initialUserSelectedCount = 0;
  this.serverRequests = [{name: 'categories', resultStore: this.model.categories},{name: 'users', resultStore: this.model.users},{name: 'tasks', resultStore: this.model.tasks}];
  this.completedServerRequests = 0;

  this.init = function() {
    // Request server data
    this.processServerRequests('categories',this.model.categories);
    // Extra custom bindings in jquery
    $(document).on('click','.checkboxBlock', function(e) {
      $(e.currentTarget).children('input').click();
    });
    $(document).on('click','.btnTaskDelete', function(e) {
      $(e.currentTarget).siblings('.deleteConfirmBlock').toggleClass('open');
    });
    $(document).on('click','.btnDeleteCancel', function(e) {
      $(e.currentTarget).parent().toggleClass('open');
    });
  }
  /* Process requests to the server */
  this.processServerRequests = function() {
    // Begin requests
    for(var i=0; i<this.serverRequests.length;i++) {
      var request = this.serverRequests[i];
      this.makeAjaxCall(request.name, request.resultStore);
    }
  }
  /* Request data from server */
  this.makeAjaxCall = function(path,resultArray) {
    var relThis = this;
    // Performa ajax call to server
    $.ajax({
      url: "/" + path,
      success: function (data) {
        // Confirm data length
        if (data.length>0) {
          // Alternate data structures for different models
          if (path == 'tasks') {
            // Tasks Model
            // Convert nested resource objects to IDs
              for (var i=0; i<data.length; i++) {
                var task = data[i];
                var catId = task.category.id;
                var createdById = task.created_by.id;
                data[i].category = catId;
                data[i].created_by = createdById;
                // Store in array ready for dom
                resultArray.push(data[i]);
              }
          } else {
            // Categories and User Models
            // Loop and build object to to include in array for dropdown selection
            for (var i=0; i<data.length; i++) {
                var result = data[i];
                var outputItem = {};
                outputItem.id = result.id;
                outputItem.name = result.name;
                // Store in array ready for dom
                resultArray.push(outputItem);
            }
          }
        }
      },
      // After each complete server request we increase counter of requests completed
      complete: function() {
        relThis.completedServerRequests++;
        if (relThis.completedServerRequests == relThis.serverRequests.length) {
          // We have completed all server requests so init DOM
           relThis.initialiseDOM ();
        }
      }
    })
  }
  /* Create Dynamic model view for ko */
  this.createTaskListView = function() {
    var relThis = this;
    var self = this.taskListView;
    // Use data already saved from server
    self.availableCategories = this.model.categories;
    self.availableUsers = this.model.users;
    // Set observed empty array prior to server request
    self.tasks = ko.observableArray([]);
    // Set observed element for user select and function to monitor when changed
    self.selectCurrentUser = ko.observable();
    // Set observed elements for create form
    self.newTaskText = ko.observable();
    self.newTaskCategory = ko.observable();
    self.newTaskDueDate = ko.observable();
    // Computed function to determine selected user and obtain user record
    self.selectedUser = ko.computed(function() {
      var selectedName = "";
      for(var i=0; i<self.availableUsers().length; i++) {
        var user = self.availableUsers()[i];
        if (user.id == self.selectCurrentUser()) {
          selectedName = user.name;
        }
      }
      return selectedName;   
    })
    
    // Control operations
    self.addTask = function() {
      // Reset invalid classes
      $('.invalid').removeClass('invalid');
      // Set failures counter
      var failCount = 0;
      // Check validations
      var valid = true; 
      if (this.newTaskText() == undefined || this.newTaskText() == "") {
        $('#addFieldTask').addClass('invalid');
        failCount++;
      } 
      if (this.newTaskDueDate() == undefined || this.newTaskDueDate() == "") {
        $('#addFieldDueDate').addClass('invalid');
        failCount++;
      } 
      if (this.newTaskCategory() == undefined || this.newTaskCategory() == "") {
        $('#addFieldCategory').addClass('invalid');
        failCount++;
      } 
      // If no failures then continue to save
      if (failCount==0) {
        // Format the date we have been sent from the form
        var dateObject = new Date(moment(String(this.newTaskDueDate()), "DD/MM/YYYY"));
        var formattedDate = moment(dateObject).format("YYYY-MM-DD HH:mm:ss");
        // Create new object to hold task data
        var newItemData = { name: this.newTaskText(), category: this.newTaskCategory(),  created_by: this.selectCurrentUser(), due_date: formattedDate}
        // Post create request to build database record
        $.ajax("/tasks", {
            data: JSON.stringify(newItemData),
            type: "POST", contentType: "application/json",
            success: function(reply) {
                // Confirmation of DB record creation build new model view for ko
                if (reply.result == 'success') {
                  // Create new KO item
                  var task = reply.data;
                  var catId = task.category.id;
                  var createdById = task.created_by.id;
                  task.category = catId;
                  task.created_by = createdById;
                  var newItem = new TaskModelView(task);
                  self.tasks.push(newItem);
                  self.newTaskText("");
                  self.newTaskDueDate("");
                  self.newTaskCategory("");
                  // Use Save button to indicate progress to user
                  $('#btnAddTask').html($('#btnAddTask').html().replace('Add','Added')).addClass('success').find('i').toggleClass('fa-plus').toggleClass('fa-check');
                  setTimeout(function(){ 
                    $('#btnAddTask').html($('#btnAddTask').html().replace('Added','Add')).removeClass('success').find('i').toggleClass('fa-plus').toggleClass('fa-check');
                  }, 1000);
                // Failed to save
                } else {
                  $(element).siblings('.iconSaving').removeClass('fa-refresh fa-spin').addClass('fa-times');
                  $(element).addClass('invalid');
                  // Revert icon
                  setTimeout(function(){ 
                    $(element).removeClass('invalid');
                  }, 1000);
                }
            },
            error: function(reply){
              $(element).siblings('.iconSaving').removeClass('fa-refresh fa-spin').addClass('fa-times');
              $(element).addClass('invalid');
              // Revert icon
              setTimeout(function(){ 
                $(element).removeClass('invalid');
              }, 1000);
            }
        });
       };
    };
      // The current item will be passed as the first parameter, so we know which place to remove
      self.removeTask = function(task) { 
        // Clear from DB
        $.ajax("/tasks/" + task.id(), {
          type: "DELETE", contentType: "application/json",
          success: function(reply) {
            // Check result
            if (reply.result == 'success') {
              // Clear from DOM
              self.tasks.remove(task);
            }
          }
        });
    };

    // Load initial state from server, convert it to Task instances, then populate self.tasks
    var mappedTasks = $.map(relThis.model.tasks, function(item) { /*console.log('i:',item);*/ return new TaskModelView(item) });
    self.tasks(mappedTasks);

    return this.taskListView;
  }
  /* Initalise DOM for Knockout JS */
  this.initialiseDOM = function() {
    var relThis = this;
    // Initialise Knockout JS for dom control
    // Set custom bindings
    // Initial User Select
    ko.bindingHandlers.selectUser = {
      update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the inital user is selected
        element.onchange = function () {
          if (relThis.initialUserSelectedCount > 0) {
            $('.preSelectMessage').hide();
            $('.postSelectMessage').fadeIn();
            $('#addNewTaskBlock').fadeIn();
            //$('.userSelect').hide();
            $('.tasksBlock').slideDown();
            // Update Add Form
            relThis.taskListView.newTaskUser = element.value;
          } else {
            relThis.initialUserSelectedCount++;
          }
        }
      }
    };
    // Custom binding handler to update task when field changed
    ko.bindingHandlers.updateData = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
          // This will be called when the binding is first applied to an element
          // Set up any initial state, event handlers, etc. here
          element.onchange = function () {
            // Set vars
            var updatedField = $(element).data("field");
            var updatedValue = element.value;
            var taskId = viewModel.id();
            var errors = 0;
            // Prep Json object
            var jsonItem = {};
            jsonItem[updatedField] = updatedValue;
            // Indicate start saving
            $(element).siblings('.iconSaving').toggleClass('fa-pencil').toggleClass('fa-refresh fa-spin');
            // Data formatting for some fields
            if (updatedField == 'time_taken') {
              floatTest = relThis.validateFloat(updatedValue);
              if (floatTest == false) {
                errors++;
              }
            }
            // If we are error free then update to server
            if (errors==0) {
              // PUT update for task to api endpoint
              $.ajax("/tasks/" + taskId, {
                  data: JSON.stringify(jsonItem),
                  type: "PUT", contentType: "application/json",
                  success: function(reply) { 
                    if (reply.result == 'success') {
                      // Indicate to user success
                      $(element).siblings('.iconSaving').removeClass('fa-refresh fa-spin').addClass('fa-save');
                      $(element).addClass('success');
                      // Has an imcomplete task been completed?
                      var parentEl = $(element).parents('.taskBlock');
                      if (parentEl.hasClass('taskOnTime')) {
                        parentEl.removeClass('taskOnTime').addClass('taskComplete');
                      }
                      // Update viewModel data
                      viewModel.name = reply.data.name;
                      viewModel.time_taken = reply.data.time_taken;
                      viewModel.completion_date = reply.data.completion_date;
                      // Revert icon that were success
                      setTimeout(function(){ 
                        $(element).removeClass('success');
                        $(element).siblings('.iconSaving').toggleClass('fa-save').toggleClass('fa-pencil');
                      },  1000);
                    } else if (reply.result == 'fail') {
                      // Invalid response so notify user request failed
                      relThis.saveRequestErrorHandler(null,{inputEl: element});
                    }
                  },
                  error: jQuery.proxy(relThis,{inputEl: element},'saveRequestErrorHandler'),
              });
            } else {
              // Error with input before call
              relThis.saveRequestErrorHandler(null,{inputEl: element});
            }
        };
      }
    };
    // Custom binding to ask for help completing task
    ko.bindingHandlers.requestHelp = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      // Checking the box for task complete switches the view to prompt the user to enter time taken
        element.onclick = function () {
          var updatedField = $(element).data("field");
          var taskId = viewModel.id();
          viewModel.helpflag(true);
          // PUT update for task to api endpoint
          var jsonItem = {};
          jsonItem[updatedField] = true;
            $.ajax("/tasks/" + taskId, {
                data: JSON.stringify(jsonItem),
                type: "PUT", contentType: "application/json",
                success: function(reply) { 
                  if (reply.result == 'success') {
                  } else if (reply.result == 'fail') {
                    // Invalid response so notify user request failed
                    relThis.saveRequestErrorHandler(null,{inputEl: element});
                  }
                },
                error: jQuery.proxy(relThis,{inputEl: element},'saveRequestErrorHandler')
            });
        }
      }
    };
    // Custom binding handler for controlling interface when a task is toggled complete
    ko.bindingHandlers.taskCompleted = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
          // Checking the box for task complete switches the view to prompt the user to enter time taken
          element.onchange = function () {
            $(element).parent('.checkboxBlock').siblings('.taskOutlineBlock').toggle();
            $(element).parent('.checkboxBlock').siblings('.timeTakenBlock').toggle();
        };
      }
    };
    // Custom binding handler to format date record from model to readable format
    ko.bindingHandlers.dateString = {
          init : function(element, valueAccessor) {
              var value = valueAccessor();
              var valueUnwrapped = ko.utils.unwrapObservable(value);
              if (valueUnwrapped) {
                   element.value = moment(valueUnwrapped).format('L');
              }
              
          },
          update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

          }
      };
      // Initiate knockout View Models
      ko.applyBindings(this.createTaskListView());
      // Initate date picker functionality
      $('.datePicker').datetimepicker({ dateFormat: "dd/mm/yy" });
  }
  // Error handler for ajax failures or invalid successful responses
  this.saveRequestErrorHandler = function(e,data) {
      $(data.inputEl).siblings('.iconSaving').removeClass('fa-refresh fa-spin').addClass('fa-times');
      $(data.inputEl).addClass('invalid');
      // Revert icon
      setTimeout(function(){ 
        $(data.inputEl).removeClass('invalid');
      }, 1000);
  }

  /* Validate front end float values */
  this.validateFloat = function(s) {
    var rgx = /^[0-9]*\.?[0-9]*$/;
    //return s.match(rgx);
    return rgx.test(s);
  }
  /* Start */
  this.init();
};
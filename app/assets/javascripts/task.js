/* KO model view definition for task */
function TaskModelView(data, currentUser) {
	  this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.category = ko.observable(data.category);
    this.created_by = ko.observable(data.created_by);
    this.due_date = ko.observable(data.due_date);
    this.completion_date = ko.observable(data.completion_date);
    this.time_taken = ko.observable(data.time_taken);
    this.helpflag = ko.observable(data.helpflag);
    // Set initial checkbox of task completed
    if (data.time_taken == null) {
      this.task_completed = ko.observable(false);
    } else {
      this.task_completed = ko.observable(true);
    }
    // Format model record date to readable
    this.formatDueDate = ko.pureComputed(function() {
        var outputDate = moment(data.due_date).format('D/M/Y H:mm');
        // Make allowance for tasks set without due date
        if (outputDate == 'Invalid date') {
          return "Not Set";
        } else {
          return outputDate;
        }
    });
    // Calculate state of task based on presence of completion date and date comparison with now
    this.taskState = ko.pureComputed(function() {
      // Is due date prior to now?
      var today = new Date();
      var overdue = moment(data.due_date).isBefore(today);
      // If it hasn't been completed then check if it's late
      if (data.completion_date == null) {
        return overdue == true ? "taskOverdue" : "taskOnTime";
      // Otherwise display as valid
      } else {
        return "taskComplete";
      }
    });
    // Visible control to only show tasks owned by selected
    this.taskOwnedByCurrentUser = function() {
      var currentUser = tasksController.taskListView.selectCurrentUser();
      return currentUser == data.created_by ? true : false;
    };


}
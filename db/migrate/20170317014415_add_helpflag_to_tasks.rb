class AddHelpflagToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :helpflag, :boolean
  end
end

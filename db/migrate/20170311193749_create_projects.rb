class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.string :description
      t.string :department
      t.string :timestamp
      t.string :due_date
      t.string :timestamp

      t.timestamps
    end
  end
end

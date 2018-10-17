class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :email
      t.string :active
      t.string :boolean

      t.timestamps
    end
  end
end

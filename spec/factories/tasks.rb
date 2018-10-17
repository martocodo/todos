# spec/factories/tasks.rb
FactoryGirl.define do
  factory :task do
    name { Faker::Lorem.word }
    category :category
    created_by :user
    due_date DateTime.now + 1.week
  end
end

FactoryGirl.define do
  factory :user do
    name {Faker::Name.first_name Faker::Name.last_name}
    email "test@test.com"
    active true    
  end
end

FactoryGirl.define do
  factory :category do
    name "Test Category" 
  end
end
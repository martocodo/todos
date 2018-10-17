class User < ActiveRecord::Base
  validates_presence_of :name
  enum level: { user: 0, admin: 1 }
end

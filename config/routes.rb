Rails.application.routes.draw do
  # All API Task routes
  resources :tasks
  # Landing page for tasks management
  root 'tasks#home', as: :home
  # API requests for categories and users
  get 'categories' => 'categories#index', as: :categories
  get 'users' => 'users#index', as: :users
end

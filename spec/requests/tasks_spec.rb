# spec/requests/tasks_spec.rb
require 'rails_helper'

RSpec.describe 'Tasks API', type: :request do

  # Initialize the test data
  let!(:task) { Task.first } 
  let!(:tasks) { Task.all }
  let(:task_id) { task.id }
  let(:id) { tasks.first.id }

  # Test suite for GET /tasks
  describe 'GET /tasks' do
    before { get "/tasks" }

    context 'when task exists' do
      it 'returns status code 200' do
        expect(response).to have_http_status(200)
      end

      it 'returns all task tasks' do
        puts "All tasks: #{Task.count}"
        expect(json.size).to be > 0
      end
    end
  end

  # Test suite for GET /tasks/:id
  describe 'GET /tasks/:id' do
    before { get "/tasks/#{id}" }

    context 'when task item exists' do
      it 'returns status code 200' do
        expect(response).to have_http_status(200)
      end

      it 'returns the item' do
        expect(json['id']).to eq(id)
      end
    end

    context 'when task does not exist' do
      let(:id) { 0 }

      it 'returns status code 404' do
        expect(response).to have_http_status(404)
      end

      it 'returns a not found message' do
        expect(response.body).to match(/Couldn't find Task/)
      end
    end
  end

   # Test suite for POST /tasks
  describe 'POST /tasks' do
    # Create Sample data
    let(:valid_json_attributes) { '{"name": "I am a spec test task", "category": 1, "created_by": 1, "due_date": "' + (DateTime.now + 1.week).to_s + '"}' }

    # Success Create Tests
    context 'when request attributes are valid' do
      before { post "/tasks", valid_json_attributes, { 'CONTENT_TYPE'=> 'application/json' } }

      it 'returns status code 200' do
        expect(response).to have_http_status(200)
      end

      it 'returns valid json response' do
        expect(json['result']).to eq("success")
      end

      it 'returns new task record' do
        expect(json['data'].size).to be > 0
      end

    end

    # Invalid Create Tests
    context 'when an invalid request' do
      before { post "/tasks", params: {} }

      it 'returns status code 200' do
        expect(response).to have_http_status(200)
      end

      it 'returns a failure message' do
        expect(json['result']).to eq("fail")
      end
    end

  end

  # Test suite for PUT /tasks/:id
  describe 'PUT /tasks/:id' do
    let(:valid_json_attributes) { '{"name": "Spec test updated task name", "time_taken": "2.5", "completion_date": "' + (DateTime.now).to_s + '"}' }
    #params.permit(:name, :completion_date, :time_taken, :helpflag)
    before { put "/tasks/#{id}", valid_json_attributes, { 'CONTENT_TYPE'=> 'application/json' } }

    context 'when task exists' do
      it 'returns status code 200' do
        expect(response).to have_http_status(200)
      end

      it 'updates the task' do
        updated_task = Task.find(id)
        expect(updated_task.name).to match(/Spec test updated task name/)
      end
    end

    context 'when the item does not exist' do
      let(:id) { 0 }

      it 'returns a not found message' do
        expect(response.body).to match(/Couldn't find Task/)
      end

    end
  end

  # Test suite for DELETE /tasks/:id
  describe 'DELETE /tasks/:id' do
    before { delete "/tasks/#{id}" }

    it 'returns status code 200' do
      expect(response).to have_http_status(200)
      expect(json['result']).to eq("success")
    end

    it 'returns valid json response' do
      expect(json['result']).to eq("success")
    end
  end



  
end
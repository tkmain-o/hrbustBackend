import tflearn
from tflearn.layers.core import input_data, dropout, fully_connected
from tflearn.layers.conv import conv_2d, max_pool_2d
from tflearn.layers.normalization import local_response_normalization
from tflearn.layers.estimator import regression

from image_filter import training_data_loader

x, y = training_data_loader('samples/')
t_x, t_y = training_data_loader('test_samples/')

network = input_data([None, 10, 13, 1], name='input')
network = conv_2d(network, 13, 3, activation='relu', regularizer="L2")
network = max_pool_2d(network, 2)
network = local_response_normalization(network)
network = conv_2d(network, 26, 3, activation='relu', regularizer="L2")
network = max_pool_2d(network, 2)
network = local_response_normalization(network)
network = fully_connected(network, 52, activation='tanh')
network = dropout(network, 0.8)
network = fully_connected(network, 104, activation='tanh')
network = dropout(network, 0.8)
network = fully_connected(network, 10, activation='softmax')
network = regression(network, optimizer='adam', learning_rate=0.01, loss='categorical_crossentropy', name='target')

model = tflearn.DNN(network, tensorboard_verbose=0)
model.fit({'input': x}, {'target': y}, n_epoch=500, validation_set=({'input': t_x}, {'target': t_y}), batch_size=20,snapshot_step=20, show_metric=True, run_id="digits_cnn")

model_name = "convimg_13_v2.tfl"

model.save(model_name)
print("Network trained and saved as " + model_name)
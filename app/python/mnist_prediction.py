import tflearn
from tflearn.layers.core import input_data, dropout, fully_connected
from tflearn.layers.conv import conv_2d, max_pool_2d
from tflearn.layers.estimator import regression
from tflearn.layers.normalization import local_response_normalization
import scipy
import numpy as np
import argparse
from PIL import Image, ImageOps

# Argument parser
# parser = argparse.ArgumentParser(description='Predict a number')
# parser.add_argument('image', type=str, help='Teh image file to check')
# args = parser.parse_args()

# Set CNN layers
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

# Load Model
# model = tflearn.DNN(network, tensorboard_verbose=0, checkpoint_path='convnet-mnist.tfl.ckpt')
# model.load("convnet-mnist.tfl")
model = tflearn.DNN(network, tensorboard_verbose=0, checkpoint_path='convimg_13.tfl.ckpt')
model.load("convimg_13_v2.tfl")

def pre_process(image_path):
    """
    :param image_path: File path of the image
    :return: An numpy array with shape (28,28,1)
    """
    image = Image.open(image_path).convert('L')
    image = ImageOps.fit(image, (28,28))
    image = ImageOps.invert(image)
    img_arr = np.array(image).astype(np.float32)
    img_arr = np.multiply(img_arr, 1.0 / 255.0)
    img_arr = img_arr.reshape(28,28,1)
    return img_arr

def make_prediction(image_path):
    """
    :param image_path: File path of the image for prediction
    :return: An integer of guessing
    """

    # Process image to valid form
    # img = pre_process(image_path)

    image = Image.open(image_path).convert('L')
    image = image.resize((10, 13), Image.ANTIALIAS)
    img_arr = np.array(image).astype(np.float32)
    img_arr = np.multiply(img_arr, 1.0 / 255.0)
    img_arr = img_arr.reshape(10, 13, 1)

    # Make prediction of the image
    # prediction = model.predict([img])
    prediction = model.predict([img_arr])
    print(prediction[0])
    print(np.argmax(prediction[0]))
    return np.argmax(prediction[0])

def picture_prediction(digits_list):
    prediction = model.predict(digits_list)
    # print(prediction)
    digits = 0
    for digit_prob in prediction:
        digits *= 10
        curr_digit = np.argmax(digit_prob)
        digits += curr_digit
    return digits

# image = Image.open(args.image).convert('L')
# image = image.resize((10, 13), Image.ANTIALIAS)
# image = ImageOps.invert(image)
# image = ImageOps.autocontrast(image, 60)
# image.show()
# img_arr = np.array(image).astype(np.float32)
# print(img_arr)
# for (x,y), value in np.ndenumerate(img_arr):
#     if value < 150:
#         img_arr[x][y] = 0
# print(img_arr)
# img_arr = np.multiply(img_arr, 1.0 / 255.0)
# img = scipy.misc.toimage(img_arr)
# img.show()
# img_arr = img_arr.reshape(10,13,1)
# prediction = model.predict([img_arr])
# print(prediction[0])
# print(np.argmax(prediction[0]))

# import tflearn.datasets.mnist as mnist
#
# x, y, test_x, test_y = mnist.load_data(one_hot=True)
# x = x.reshape([-1, 28, 28, 1])
# test_x = test_x.reshape([-1, 28, 28, 1])
#
# ret = test_x[0].reshape(28,28)
# print(ret)
# ret_img = scipy.misc.toimage(ret)
# ret_img.show()
from client.client import dynamodb
from client.client import comprehend
from server import app
from flask import request
import hashlib

@app.route('/')
def hello():
    return '<h1>Hello, World!</h1>'

@app.route('/categories', methods=['GET'])
def get_categories():
    response = dynamodb.scan(
        TableName = 'categories'
    )

    categories = response.get('Items', [])
    formatted_categories = [
        {
            'categoryId': item['categoryId']['S'],
            'categoryName': item['categoryName']['S']
            } for item in categories
        ] 
    
    return formatted_categories

@app.route('/products/<categoryId>', methods=['GET'])
def get_products(categoryId):
    response = dynamodb.scan(
        TableName = 'products',
        FilterExpression='categoryId = :cid',
        ExpressionAttributeValues = {':cid': {'S': categoryId}}
    )

    products = response.get('Items', [])
    formatted_products = [
        {
            'productId': item['productId']['S'],
            'categoryId': item['categoryId']['S'],
            'productName': item['productName']['S']
            } for item in products
        ] 
    
    return formatted_products

@app.route('/reviews/<productId>', methods=['GET'])
def get_reviews(productId):
    formatted_reviews = []
    last_evaluated_key = None

    try:
        while True:
            params = {
                'TableName': 'reviews',
                'FilterExpression': 'productId = :pid',
                'ExpressionAttributeValues': {':pid': {'S': productId}}
            }

            if last_evaluated_key:
                params['ExclusiveStartKey'] = last_evaluated_key

            response = dynamodb.scan(**params)
            reviews = response.get('Items', [])
            formatted_reviews.extend([
                {
                    'reviewId': item['reviewId']['S'],
                    'productId': item['productId']['S'],
                    'reviewText': item['reviewText']['S'],
                    'reviewTitle': item['reviewTitle']['S'],
                    'reviewDate': item['reviewDate']['S']
                } for item in reviews
            ])

            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
    except Exception as e:
        print('Error while fetching Products!')
        print(e)
    
    return formatted_reviews

def check_size(reviews):
    checked_reviews = []
    for review in reviews:
        if(len(review['reviewText'].encode('utf-8')) < 5000):
            checked_reviews.append(review)

    return checked_reviews

@app.route('/sentiments/<productId>', methods=['GET'])
def get_sentiments(productId):
    all_reviews = get_reviews(productId)
    print(len(all_reviews))

    reviews = check_size(all_reviews)
    print(len(reviews))

    sentiments = []

    for i in range(0, len(reviews), 25):
        batch_reviews = reviews[i:i+25]
        texts = [review['reviewText'] for review in batch_reviews]

        try:
            response = comprehend.batch_detect_sentiment(TextList=texts, LanguageCode='en')

            for idx, result in enumerate(response['ResultList']):
                sentiment = result['Sentiment']
                sentiment_score = result['SentimentScore']

                review = batch_reviews[idx]

                sentiments.append({
                    'reviewId': review['reviewId'],
                    'reviewText': review['reviewText'],
                    'reviewTitle': review['reviewTitle'],
                    'reviewDate': review['reviewDate'],
                    'sentiment': sentiment,
                    'sentimentScore': sentiment_score
                })

        except Exception as e:
            print(f"Error while analyzing sentiments in batch {i//25}")
            print(e)

    return sentiments

def generate_hash(text):
    return hashlib.sha256(text.encode()).hexdigest()

def item_exists(table_name, key_name, key_value):
    try:
        response = dynamodb.get_item(
            TableName = table_name,
            Key = {
                key_name: {'S': key_value}
            }
        )
        if 'Item' in response:
            return True
        else:
            return False
    except Exception as e:
        print('Item Not Found!')
        print(e)
        return False

@app.route('/subscribe', methods=['POST'])
def subscribe():
    try:
        params = request.args

        if 'userId' not in params or 'productId' not in params:
            return 'userId or productId not present!'
            
        subscriptionId = generate_hash(params.get('userId') + params.get('productId'))
        
        if not item_exists('subscriptions', 'subscriptionId', subscriptionId):
            response = dynamodb.put_item(
                TableName= 'subscriptions',
                Item =  {
                    'subscriptionId': {'S': subscriptionId},
                    'userId': {'S': params.get('userId')},
                    'productId': {'S': params.get('productId')} 
                }
            )
            return 'Subscription Successful!'
        else:
            return 'Already Subscribed!'
    except Exception as e:
        print('Unable to Subscribe to a Product!')
        print(e)
        return 'Unable to Subscribe to a Product!'
    
@app.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    try:
        params = request.args

        if 'userId' not in params or 'productId' not in params:
            return 'userId or productId not present!'
            
        subscriptionId = generate_hash(params.get('userId') + params.get('productId'))
        
        if item_exists('subscriptions', 'subscriptionId', subscriptionId):
            response = dynamodb.delete_item(
                TableName='subscriptions',
                Key={
                    'subscriptionId': {'S': subscriptionId}
                }
            )
            return 'Unsubscription Successful!'
        else:
            return 'Subscription Not Found!'
    except Exception as e:
        print('Unable to Unsubscribe from a Product!')
        print(e)
        return 'Unable to Unsubscribe from a Product!'

@app.route('/productname/<productId>', methods=['GET'])
def get_product_name(productId):
    try:
        response = dynamodb.get_item(
            TableName = 'products',
            Key = {
                'productId': {'S': productId}
            }
        )
        if 'Item' in response:
            return response['Item']['productName']['S']
        else:
            return ''
    except Exception as e:
        print('Unable to find Product')
        print(e)
        return ''

@app.route('/usersubscriptions', methods=['GET'])
def get_subscriptions():
    params = request.args

    if 'userId' not in params:
        return 'userId not provided!'
        
    userId = params.get('userId')
    
    response = dynamodb.scan(
        TableName = 'subscriptions',
        FilterExpression='userId = :uid',
        ExpressionAttributeValues = {':uid': {'S': userId}}
    )

    subscriptions = response.get('Items', [])
    formatted_subscriptions = [
        {
            'subscriptionId': item['subscriptionId']['S'],
            'userId': item['userId']['S'],
            'productId': item['productId']['S'],
            'productName': get_product_name(item['productId']['S'])
            } for item in subscriptions
        ] 
    
    return formatted_subscriptions
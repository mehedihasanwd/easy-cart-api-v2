This is an ecommerce API having staff and user role. Have a look at below role based access description:

- User access
    - What user can/can’t do in User model
        - User can
            - register & login their account
            - can logout from their account
            - can reset & change their password
            - can see their account info
            - can update some of their account info
            - can update their profile image (Also should change the user_image or every review he/she posted)
            - both user and admin staff can delete their account except user have any active order
        - User can’t
            - Can’t do anything described in “User can” part in someone else’s account

    - What user can/can’t do in product model
        - User can view all products

    - What user can/can’t do in Order model
        - User can
            - can create order only if he/she is logged in
            - can view an specific order using order id only if he/she is logged in and the order is his/her own
            - can see all of his orders using his/her account id
            - can see ordered products of an order using his/her user_id and order id
        - User can’t
            - Can’t do anything point out in “User can” part

    - What user can/can’t do in review model
        - User can
            - can create review for their own order/s for individual product only if they’re logged in
            - can view their own review/s only if they’re logged in
        - User can’t
            - can’t delete their review and can’t do anything those described in “User can” part to someone else’s review

- Staff access
    - What staff can/can’t do in Staff model
        - Staff can
            - register & login their own account
            - can logout from their own account
            - can reset & change their own account password
            - can see their account info
            - can update some of their own account info
            - can update their own profile image
            - Only super admin can delete any staff account
            - can view all staff account
        - Staff can’t
            - Can’t do any modification described in “Staff can” part in someone else’s account except super admin wants to

    - What staff can/can’t do in User model
        - both user and admin staff can delete their account except they have any active order

    - What staff can/can’t do in product model
        - Staff can
            - can add new product
            - can view all products
            - can add multiple products
            - can view products based on particular status. (”active”, “inactive”)
            - can view products based on stock (greater than 1 → instock, less than 1 → stockout)
            - can view discounted products
            - can view top category products
            - can view, modify (status, discount, product details), delete any specific product
        - Staff can’t
            - Editor staff can’t delete any product

    - What staff can/can’t do in Order model
        - Staff can
            - can create order only if he/she is logged in
            - can view an specific order using order id only if he/she is logged in and the order is his own
            - can see all of his orders using his account id
        - Staff can’t
            - Can’t do anything point out in “User can” part

    - What staff can/can’t do in review model
        - Staff can
            - Can view all the reviews or any particular review
            - Admin Staffs can delete any review
        - Staff can’t
            - Can’t add, edit any review

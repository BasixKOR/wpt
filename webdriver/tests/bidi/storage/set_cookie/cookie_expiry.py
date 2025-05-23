import pytest
from .. import assert_cookie_is_not_set, assert_partition_key, assert_cookie_is_set, create_cookie
from datetime import datetime, timedelta
import time

pytestmark = pytest.mark.asyncio


async def test_cookie_expiry_unset(bidi_session, set_cookie, domain_value):
    set_cookie_result = await set_cookie(
        cookie=create_cookie(
            domain=domain_value(),
            expiry=None))

    await assert_partition_key(bidi_session, actual=set_cookie_result["partitionKey"])

    await assert_cookie_is_set(bidi_session, expiry=None, domain=domain_value())


async def test_cookie_expiry_future(bidi_session, set_cookie, domain_value):
    tomorrow = datetime.now() + timedelta(1)
    tomorrow_timestamp = time.mktime(tomorrow.timetuple())

    set_cookie_result = await set_cookie(
        cookie=create_cookie(
            domain=domain_value(),
            expiry=tomorrow_timestamp))

    await assert_partition_key(bidi_session, actual=set_cookie_result["partitionKey"])

    await assert_cookie_is_set(bidi_session, expiry=tomorrow_timestamp, domain=domain_value())


async def test_cookie_expiry_past(bidi_session, set_cookie, domain_value):
    yesterday = datetime.now() - timedelta(1)
    yesterday_timestamp = time.mktime(yesterday.timetuple())

    set_cookie_result = await set_cookie(
        cookie=create_cookie(
            domain=domain_value(),
            expiry=yesterday_timestamp))

    await assert_partition_key(bidi_session, actual=set_cookie_result["partitionKey"])

    await assert_cookie_is_not_set(bidi_session)
